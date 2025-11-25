import type { E18EMcpServer } from '../../index.js';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';
import { prompt } from 'tmcp/utils';

export function task(server: E18EMcpServer) {
	server.prompt(
		{
			name: 'task',
			description:
				'A prompt to execute a task using the e18e MCP server at the best of its abilities.',
			icons,
			schema: v.object({
				task: v.string(),
			}),
		},
		async ({ task }) => {
			return prompt.text(
				`You are an expert software development assistant. When installing or using a package please always check with the e18e MCP server for possible better alternatives using the \`npm-i-checker\` command. Your task is: ${task}`,
			);
		},
	);
}
