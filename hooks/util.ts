import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const AGENTS_MD = "AGENTS.md";
const LOCK_TIMEOUT_MS = 5000;
const LOCK_RETRY_MS = 10;
const LOCK_STALE_MS = 30000; // Consider lock stale after 30s

export function findAgentsMd(startDir: string): string | null {
  let dir = startDir;
  const root = "/";

  while (dir !== root) {
    const candidate = join(dir, AGENTS_MD);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function getStateDir(): string {
  const dir = join(tmpdir(), "agents-md-plugin");
  mkdirSync(dir, { recursive: true });
  return dir;
}

function getSeenFile(sessionId: string): string {
  return join(getStateDir(), `seen-${sessionId}.json`);
}

function getLockFile(sessionId: string): string {
  return join(getStateDir(), `seen-${sessionId}.lock`);
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0); // Signal 0 = check if process exists
    return true;
  } catch {
    return false;
  }
}

function isLockStale(lockFile: string): boolean {
  try {
    const content = readFileSync(lockFile, "utf-8");
    const { pid, timestamp } = JSON.parse(content);

    // Check if lock is too old
    if (Date.now() - timestamp > LOCK_STALE_MS) {
      return true;
    }

    // Check if holding process is dead
    if (!isProcessAlive(pid)) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

async function acquireLock(sessionId: string): Promise<void> {
  const lockFile = getLockFile(sessionId);
  const start = Date.now();

  while (Date.now() - start < LOCK_TIMEOUT_MS) {
    // Clean up stale locks
    if (existsSync(lockFile) && isLockStale(lockFile)) {
      try { unlinkSync(lockFile); } catch {}
    }

    if (!existsSync(lockFile)) {
      // Write to temp file first
      const tempFile = `${lockFile}.${process.pid}.${Date.now()}`;
      const lockData = JSON.stringify({ pid: process.pid, timestamp: Date.now() });

      try {
        writeFileSync(tempFile, lockData);
        // Atomic rename - fails if target exists on some systems, overwrites on others
        // So we check existence first (small race window, but acceptable for this use case)
        renameSync(tempFile, lockFile);

        // Verify we own the lock
        const content = readFileSync(lockFile, "utf-8");
        const { pid } = JSON.parse(content);
        if (pid === process.pid) {
          return;
        }
      } catch {
        try { unlinkSync(tempFile); } catch {}
      }
    }

    await Bun.sleep(LOCK_RETRY_MS);
  }
  throw new Error(`Failed to acquire lock after ${LOCK_TIMEOUT_MS}ms`);
}

function releaseLock(sessionId: string): void {
  const lockFile = getLockFile(sessionId);
  try {
    const content = readFileSync(lockFile, "utf-8");
    const { pid } = JSON.parse(content);
    if (pid === process.pid) {
      unlinkSync(lockFile);
    }
  } catch {}
}

export function getSeenPaths(sessionId: string): Set<string> {
  const file = getSeenFile(sessionId);
  if (!existsSync(file)) return new Set();
  const data = JSON.parse(readFileSync(file, "utf-8"));
  return new Set(data);
}

export async function markSeen(sessionId: string, path: string): Promise<void> {
  await acquireLock(sessionId);
  try {
    const seen = getSeenPaths(sessionId);
    seen.add(path);
    writeFileSync(getSeenFile(sessionId), JSON.stringify([...seen]));
  } finally {
    releaseLock(sessionId);
  }
}

export function readAgentsMd(path: string): string {
  return readFileSync(path, "utf-8");
}

export function formatContext(path: string, content: string): string {
  return `<agents-md path="${path}">\n${content}\n</agents-md>`;
}
