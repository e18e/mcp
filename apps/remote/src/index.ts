import { server, icon_files } from '@e18e/mcp';
import { HttpTransport } from '@tmcp/transport-http';
import index_html from './index.html';

const http_transport = new HttpTransport(server, {
	path: '/mcp',
	disableSse: true,
});

const icon_responses = new Map(
	Object.entries(icon_files).map(([name, { src, mimeType }]) => {
		const base64 = src.slice(src.indexOf(',') + 1);
		const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

		return [`/icons/${name}`, { bytes, mimeType }];
	}),
);

export default {
	async fetch(request): Promise<Response> {
		const { pathname } = new URL(request.url);

		if (pathname === '/') {
			return new Response(index_html, {
				headers: {
					'content-type': 'text/html; charset=utf-8',
					'cache-control': 'public, max-age=3600',
				},
			});
		}

		const icon = icon_responses.get(pathname);

		if (icon) {
			return new Response(icon.bytes, {
				headers: {
					'content-type': icon.mimeType,
					'cache-control': 'public, max-age=86400',
				},
			});
		}

		return (
			(await http_transport.respond(request)) ??
			new Response('Not Found', { status: 404 })
		);
	},
} satisfies ExportedHandler<Env>;
