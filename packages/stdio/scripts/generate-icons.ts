import { readFile, writeFile } from 'node:fs/promises';

const [svg, png] = await Promise.all([
	readFile(new URL('../src/icons/icon.svg', import.meta.url), 'base64'),
	readFile(new URL('../src/icons/icon.png', import.meta.url), 'base64'),
]);

const icons = [
	{
		src: 'data:image/svg+xml;base64,' + svg,
		mimeType: 'image/svg+xml',
	},
	{
		src: 'data:image/png;base64,' + png,
		mimeType: 'image/png',
	},
];

await writeFile(
	new URL('../src/icons/generated.ts', import.meta.url),
	`import type { Icons } from 'tmcp';\n\nexport const icons = ${JSON.stringify(
		icons,
		null,
		'\t',
	)} satisfies Icons['icons'];\n`,
);
