import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const AGENTS_MD = "AGENTS.md";

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

function getSeenFile(sessionId: string): string {
  const dir = join(tmpdir(), "agents-md-plugin");
  mkdirSync(dir, { recursive: true });
  return join(dir, `seen-${sessionId}.json`);
}

export function getSeenPaths(sessionId: string): Set<string> {
  const file = getSeenFile(sessionId);
  if (!existsSync(file)) return new Set();
  const data = JSON.parse(readFileSync(file, "utf-8"));
  return new Set(data);
}

export function markSeen(sessionId: string, path: string): void {
  const seen = getSeenPaths(sessionId);
  seen.add(path);
  writeFileSync(getSeenFile(sessionId), JSON.stringify([...seen]));
}

export function readAgentsMd(path: string): string {
  return readFileSync(path, "utf-8");
}

export function formatContext(path: string, content: string): string {
  return `<agents-md path="${path}">\n${content}\n</agents-md>`;
}
