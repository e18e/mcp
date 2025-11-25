import type { E18EMcpServer } from '../../index.js';
import { icons } from '../../icons/index.js';
import { complete, resource } from 'tmcp/utils';
import { get_docs } from '../../docs/index.js';

const docs = await get_docs();

export function replacement_docs(server: E18EMcpServer) {
	server.template(
		{
			name: 'replacement-docs',
			description:
				'Provides replacement documentation for deprecated or outdated APIs.',
			icons,
			uri: 'e18e://docs/{slug}',
			list() {
				return Object.keys(docs).map((doc) => ({
					name: doc,
					uri: `e18e://docs/${doc}`,
					icons,
					mimeType: 'text/plain',
					title: doc,
					description: `Documentation for migrating from ${doc.replace(
						'.md',
						'',
					)}`,
				}));
			},
			complete: {
				slug(query) {
					return complete.values(
						Object.keys(docs).filter((doc) =>
							doc.toLowerCase().includes(query.toLowerCase()),
						),
					);
				},
			},
		},
		async (uri, { slug }) => {
			const slug_string = Array.isArray(slug) ? slug.join('/') : slug;
			const text = docs[slug_string];
			if (!text) {
				throw new Error('Document not found');
			}
			return resource.text(uri, text, 'text/plain');
		},
	);
}
