#!/usr/bin/env node
/**
 * mustache MCP server. One tool: `render`.
 *
 * Render Mustache (logic-less) templates with a JSON view. Backed by
 * `mustache` — supports `{{var}}`, `{{{html}}}`, `{{#section}}`, `{{^inv}}`,
 * `{{>partial}}` (with explicit partials map), and `{{!comment}}`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Mustache from 'mustache';

const VERSION = '0.1.0';

export interface RenderOpts {
  template: string;
  view: Record<string, unknown>;
  partials?: Record<string, string>;
}

export function render(opts: RenderOpts): string {
  if (typeof opts?.template !== 'string') {
    throw new Error('`template` is required and must be a string');
  }
  if (opts.view === null || typeof opts.view !== 'object') {
    throw new Error('`view` is required and must be an object');
  }
  if (
    opts.partials !== undefined &&
    (opts.partials === null || typeof opts.partials !== 'object')
  ) {
    throw new Error('`partials` must be an object when provided');
  }
  return Mustache.render(opts.template, opts.view, opts.partials);
}

const server = new Server({ name: 'mustache', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'render',
    description:
      'Render a Mustache template with a JSON view. Optional `partials` map for `{{>name}}` includes.',
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string' },
        view: { type: 'object' },
        partials: { type: 'object', description: 'Map of partial name → template string.' },
      },
      required: ['template', 'view'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'render') return errorResult('unknown tool: ' + name);
    const a = args as unknown as RenderOpts;
    return textResult(render(a));
  } catch (err) {
    return errorResult('mustache render failed: ' + (err as Error).message);
  }
});

function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`mustache MCP server v${VERSION} ready on stdio\n`);
}
