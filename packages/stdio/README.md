# `@e18e/mcp` (STDIO)

MCP server that flags inefficient or outdated npm packages and serves migration docs. It exposes tools for checking install commands or source files, a resource template with curated replacement guides, and a helper prompt for task-oriented workflows.

## Capabilities

- **Tools**
  - `npm-i-checker`: Input an install command (`npm i`, `pnpm add`, `yarn add`, `bun i`). Returns `suggestions[]` for packages that have better-native or better-maintained alternatives.
  - `code-checker`: Input a full source file (JS/TS/JSX/TSX). Parses imports and returns `suggestions[]` when a listed module should be replaced.
- **Resources**
  - `replacement-docs` (template): URI `e18e://docs/{slug}`. Lists/reads text guides for migrating away from specific packages (auto-complete on slug; `list` returns all available docs).
- **Prompts**
  - `task`: Returns a task-focused system prompt that reminds the model to run `npm-i-checker` for installs and `code-checker` on code before replying.

## Quick start

Prereqs: Node.js ≥18 and npm/pnpm (build uses pnpm, runtime works via `npx`/`pnpm dlx`/`bunx`).

The local (or stdio) version of the MCP server is available via the [`@e18e/mcp`](https://www.npmjs.com/package/@e18e/mcp) npm package. You can either install it globally and then reference it in your configuration or run it with `npx`:

```bash
npx -y @e18e/mcp
```

Here's how to set it up in some common MCP clients:

## Claude Code

To include the local MCP version in Claude Code, simply run the following command:

```bash
claude mcp add -t stdio -s [scope] e18e -- npx -y @e18e/mcp
```

The `[scope]` must be `user`, `project` or `local`.

## Claude Desktop

In the Settings > Developer section, click on Edit Config. It will open the folder with a `claude_desktop_config.json` file in it. Edit the file to include the following configuration:

```json
{
	"mcpServers": {
		"e18e": {
			"command": "npx",
			"args": ["-y", "@e18e/mcp"]
		}
	}
}
```

## Codex CLI

Add the following to your `config.toml` (which defaults to `~/.codex/config.toml`, but refer to [the configuration documentation](https://github.com/openai/codex/blob/main/docs/config.md) for more advanced setups):

```toml
[mcp_servers.e18e]
command = "npx"
args = ["-y", "@e18e/mcp"]
```

## Gemini CLI

To include the local MCP version in Gemini CLI, simply run the following command:

```bash
gemini mcp add -t stdio -s [scope] e18e npx -y @e18e/mcp
```

The `[scope]` must be `user`, `project` or `local`.

## OpenCode

Run the command:

```bash
opencode mcp add
```

and follow the instructions, selecting 'Local' under the 'Select MCP server type' prompt:

```bash
opencode mcp add

┌  Add MCP server
│
◇  Enter MCP server name
│  e18e
│
◇  Select MCP server type
│  Local
│
◆  Enter command to run
│  npx -y @e18e/mcp
```

## VS Code

- Open the command palette
- Select "MCP: Add Server..."
- Select "Command (stdio)"
- Insert `npx -y @e18e/mcp` in the input and press `Enter`
- When prompted for a name, insert `e18e`
- Select if you want to add it as a `Global` or `Workspace` MCP server

## Cursor

- Open the command palette
- Select "View: Open MCP Settings"
- Click on "Add custom MCP"

It will open a file with your MCP servers where you can add the following configuration:

```json
{
	"mcpServers": {
		"e18e": {
			"command": "npx",
			"args": ["-y", "@e18e/mcp"]
		}
	}
}
```

## Zed

- Open the command palette
- Search and select "agent:open settings"
- In settings panel look for `Model Context Protocol (MCP) Servers`
- Click on "Add Server"
- Select: "Add Custom Server"

It will open a popup with MCP server config where you can add the following configuration:

```json
{
	"e18e": {
		"command": "npx",
		"args": ["-y", "@e18e/mcp"]
	}
}
```

## Other clients

If we didn't include the MCP client you are using, refer to their documentation for `stdio` servers and use `npx` as the command and `-y @e18e/mcp` as the arguments.
