import type { E18EMcpServer } from '../../index.js';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';
import { complete, prompt } from 'tmcp/utils';

export function task(server: E18EMcpServer) {
	server.prompt(
		{
			name: 'task',
			title: 'e18e-task',
			description:
				'A prompt to execute a task using the e18e MCP server at the best of its abilities.',
			icons,
			schema: v.object({
				task: v.string(),
			}),
			complete: {
				task() {
					// need this to avoid completion timeouts
					return complete.values([]);
				},
			},
		},
		async ({ task }) => {
			return prompt.text(
				`You are an expert software development assistant. When installing or using a package please always check with the e18e MCP server for possible better alternatives using the \`npm-i-checker\` command.

Whenever you write some code use the \`code-checker\` tool passing in the whole file to check if your importing some inefficient or outdated packages and get suggestions for better alternatives.

Your task is: ${task}`,
			);
		},
	);
}
