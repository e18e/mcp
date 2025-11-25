import type { E18EMcpServer } from './index.js';
import * as tools from './tools/index.js';
import * as resources from './resources/index.js';
import * as prompts from './prompts/index.js';

export function setup_tools(server: E18EMcpServer) {
	for (const tool_key in tools) {
		const tool = (tools as any)[tool_key];
		tool(server);
	}
}

export function setup_resources(server: E18EMcpServer) {
	for (const resource_key in resources) {
		const resource = (resources as any)[resource_key];
		resource(server);
	}
}

export function setup_prompts(server: E18EMcpServer) {
	for (const prompt_key in prompts) {
		const prompt = (prompts as any)[prompt_key];
		prompt(server);
	}
}
