import { readFile, writeFile } from 'node:fs/promises';

const [svg, png] = await Promise.all([
	readFile(new URL('../src/icons/icon.svg', import.meta.url), 'base64'),
	readFile(new URL('../src/icons/icon.png', import.meta.url), 'base64'),
]);

const icon_files = {
	'icon.svg': {
		src: 'data:image/svg+xml;base64,' + svg,
		mimeType: 'image/svg+xml',
	},
	'icon.png': {
		src: 'data:image/png;base64,' + png,
		mimeType: 'image/png',
	},
};

await writeFile(
	new URL('../src/icons/generated.ts', import.meta.url),
	`import type { Icons } from 'tmcp';

export const icon_files = ${JSON.stringify(icon_files, null, '\t')};

export const icons = Object.values(icon_files) satisfies Icons['icons'];
`,
);
