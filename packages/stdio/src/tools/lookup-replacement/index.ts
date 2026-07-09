import { tool } from 'tmcp/utils';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';
import type { E18EMcpServer } from '../../index.js';
import { lookup_replacements } from '../utils.js';

export function lookup_replacement(server: E18EMcpServer) {
	server.tool(
		{
			name: 'lookup-replacement',
			description:
				'Check if a package has a more performant, maintained or efficient replacement by package name, replacement text, or topic. Returns a list of suggestions with descriptions and documentation links.',
			icons,
			schema: v.object({
				query: v.pipe(
					v.string(),
					v.description(
						'The package name, replacement text, or topic to search for, e.g. `chalk`, `filter`, or `Array.prototype.map`.',
					),
				),
			}),
			outputSchema: v.object({
				results: v.array(
					v.object({
						source: v.picklist(['native', 'micro-utility', 'preferred']),
						module_name: v.string(),
						type: v.string(),
						description: v.optional(v.string()),
						documentation: v.optional(v.string()),
						replacement: v.optional(v.string()),
						url: v.optional(v.string()),
					}),
				),
			}),
		},
		async ({ query }) => {
			return tool.structured({
				results: lookup_replacements(query),
			});
		},
	);
}
