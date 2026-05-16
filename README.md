# mustache-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/mustache-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/mustache-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: render Mustache (logic-less) templates with a JSON view. Backed
by the `mustache` package.

## Tool

### `render`

```json
{
  "template": "Hello {{name}}! You have {{#items}}{{.}}, {{/items}}",
  "view": { "name": "Mukunda", "items": ["mail", "PRs"] }
}
```

→ `"Hello Mukunda! You have mail, PRs, "`

Optional `partials` map enables `{{>name}}` includes.

## Configure

```json
{ "mcpServers": { "mustache": { "command": "npx", "args": ["-y", "@mukundakatta/mustache-mcp"] } } }
```

## License

MIT.
