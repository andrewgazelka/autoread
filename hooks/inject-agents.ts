import { readHookInput, output } from "./types";
import { findAgentsMd, markSeen, readAgentsMd, formatContext } from "./util";

const input = await readHookInput();
const cwd = input.cwd || process.cwd();

const agentsPath = findAgentsMd(cwd);

if (agentsPath) {
  await markSeen(input.session_id, agentsPath);
  const content = readAgentsMd(agentsPath);
  output({ additionalContext: formatContext(agentsPath, content) });
} else {
  output({});
}
