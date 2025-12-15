<p align="center">
  <img src=".github/assets/header.svg" alt="agents-md" width="100%"/>
</p>

<p align="center">
  <code>claude plugin marketplace add andrewgazelka/agents-md && claude plugin install agents-md</code>
</p>

Claude Code plugin that auto-injects `AGENTS.md` into context. Bridges the gap until Anthropic adds native support.

<p align="center">
<img width="570" height="416" alt="image" src="https://github.com/user-attachments/assets/da15b637-b849-4a67-ac09-772dc45b3d65" />
</p>

> [!NOTE]
> **Dear Anthropic:** Please add native `AGENTS.md` support so I can archive this before Christmas!
>
> The [Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-launches-agentic-ai-initiative-to-accelerate-open-and-interoperable-ai-agent-ecosystem) just launched AGENTS.md as a founding project alongside MCP. OpenAI, Cursor, Zed, GitHub Copilot all support it.

## Features

- **SessionStart**: Injects `AGENTS.md` from cwd when session begins
- **Read hook**: Discovers new `AGENTS.md` files as Claude reads files in different directories
- **Per-session state**: Same file won't be injected twice

## How It Works

Hooks walk up the directory tree looking for `AGENTS.md` and inject contents as `additionalContext`. State tracked via lockfile-protected JSON in tmpdir.

## Requirements

[Bun](https://bun.sh) must be installed.

---

<details>
<summary>Why not just symlink?</summary>

You can `ln -s AGENTS.md CLAUDE.md`, but:
- Pollutes repos with Claude-specific files
- Doesn't auto-discover AGENTS.md in subdirectories
- This plugin works transparently

</details>
