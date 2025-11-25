import type { Icons } from 'tmcp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const [svg, png] = await Promise.all([
	readFile(join(import.meta.dirname, './icon.svg'), 'base64'),
	readFile(join(import.meta.dirname, './icon.png'), 'base64'),
]);

export const icons: Icons['icons'] = [
	{
		src: 'data:image/svg+xml;base64,' + svg,
		mimeType: 'image/svg+xml',
	},
	{
		src: 'data:image/png;base64,' + png,
		mimeType: 'image/png',
	},
];
