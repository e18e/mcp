import { server } from '@e18e/mcp';
import { HttpTransport } from '@tmcp/transport-http';

const http_transport = new HttpTransport(server, {
	path: '/mcp',
	disableSse: true,
});

export default {
	async fetch(request): Promise<Response> {
		return (
			(await http_transport.respond(request)) ??
			new Response('Not Found', { status: 404 })
		);
	},
} satisfies ExportedHandler<Env>;
