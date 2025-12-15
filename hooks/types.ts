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

export interface HookSpecificOutput {
  hookEventName: string;
  additionalContext?: string;
  permissionDecision?: "allow" | "deny" | "ask";
  updatedInput?: Record<string, unknown>;
}

export interface HookOutput {
  hookSpecificOutput?: HookSpecificOutput;
  systemMessage?: string;
  continue?: boolean;
  suppressOutput?: boolean;
}

export async function readHookInput(): Promise<HookInput> {
  return JSON.parse(await Bun.stdin.text());
}

export function output(result: HookOutput): void {
  console.log(JSON.stringify(result));
}

export function outputContext(hookEventName: string, additionalContext: string): void {
  output({
    hookSpecificOutput: {
      hookEventName,
      additionalContext,
    },
  });
}

export function approve(hookEventName: string, additionalContext?: string): void {
  output({
    hookSpecificOutput: {
      hookEventName,
      permissionDecision: "allow",
      ...(additionalContext && { additionalContext }),
    },
  });
}

export function block(hookEventName: string, reason: string): void {
  output({
    hookSpecificOutput: {
      hookEventName,
      permissionDecision: "deny",
    },
    systemMessage: reason,
  });
}
