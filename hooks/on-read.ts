import { dirname } from "node:path";
import { readHookInput, approve } from "./types";
import { findAgentsMd, getSeenPaths, markSeen, readAgentsMd, formatContext } from "./util";

const input = await readHookInput();
const filePath = input.tool_input?.file_path;

if (!filePath) {
  approve();
  process.exit(0);
}

const agentsPath = findAgentsMd(dirname(filePath));

if (!agentsPath) {
  approve();
  process.exit(0);
}

const seen = getSeenPaths(input.session_id);

if (seen.has(agentsPath)) {
  approve();
  process.exit(0);
}

// New AGENTS.md found - inject it
markSeen(input.session_id, agentsPath);
const content = readAgentsMd(agentsPath);
approve(formatContext(agentsPath, content));
