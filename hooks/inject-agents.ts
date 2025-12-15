import { readHookInput, outputContext, output } from "./types";
import { findAgentsMd, markSeen, readAgentsMd, formatContext } from "./util";

console.error("[agents-md] SessionStart hook executing...");

const input = await readHookInput();
console.error("[agents-md] Input received:", JSON.stringify(input));
const cwd = input.cwd || process.cwd();

const agentsPath = findAgentsMd(cwd);

if (agentsPath) {
  console.error("[agents-md] Found AGENTS.md at:", agentsPath);
  await markSeen(input.session_id, agentsPath);
  const content = readAgentsMd(agentsPath);
  const context = formatContext(agentsPath, content);
  console.error("[agents-md] Outputting context:", context.slice(0, 200));
  outputContext("SessionStart", context);
} else {
  console.error("[agents-md] No AGENTS.md found");
  output({});
}
