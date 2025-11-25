import type { E18EMcpServer } from './index.js';
import * as tools from './tools/index.js';
import * as resources from './resources/index.js';
import * as prompts from './prompts/index.js';

export function setup_tools(server: E18EMcpServer) {
	for (const tool_key in tools) {
		const tool = tools[tool_key as keyof typeof tools];
		tool(server);
	}
}

export function setup_resources(server: E18EMcpServer) {
	for (const resource_key in resources) {
		const resource = resources[resource_key as keyof typeof resources];
		resource(server);
	}
}

export function setup_prompts(server: E18EMcpServer) {
	for (const prompt_key in prompts) {
		const prompt = prompts[prompt_key as keyof typeof prompts];
		prompt(server);
	}
}
