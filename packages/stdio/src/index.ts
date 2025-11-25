#!/usr/bin/env node

import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { setup_tools, setup_prompts, setup_resources } from './setup.js';
import { icons } from './icons/index.js';

const server = new McpServer(
	{
		name: 'e18e-mcp',
		version: '1.0.0',
		icons,
		description:
			'MCP server for the ecosystem performance initiative. Used to provide module replacement suggestions for outdated or inefficient packages.',
	},
	{
		adapter: new ValibotJsonSchemaAdapter(),
		capabilities: {
			tools: { listChanged: true },
			resources: { listChanged: true },
			prompts: { listChanged: true },
			completions: {},
		},
	},
);

export type E18EMcpServer = typeof server;

setup_tools(server);
setup_resources(server);
setup_prompts(server);

const stdio_transport = new StdioTransport(server);
stdio_transport.listen();
