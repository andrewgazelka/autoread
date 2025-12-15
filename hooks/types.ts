export interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: string;
  tool_name?: string;
  tool_input?: {
    file_path?: string;
    content?: string;
    command?: string;
    [key: string]: unknown;
  };
  tool_response?: unknown;
}

export interface HookOutput {
  decision?: "approve" | "block" | "deny";
  reason?: string;
  additionalContext?: string;
  updatedInput?: Record<string, unknown>;
}

export async function readHookInput(): Promise<HookInput> {
  return JSON.parse(await Bun.stdin.text());
}

export function output(result: HookOutput): void {
  console.log(JSON.stringify(result));
}

export function approve(additionalContext?: string): void {
  output(additionalContext ? { decision: "approve", additionalContext } : { decision: "approve" });
}

export function block(reason: string): void {
  output({ decision: "block", reason });
}
