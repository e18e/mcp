import { InMemoryTransport, Session } from '@tmcp/transport-in-memory';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from './index.js';

let transport: InMemoryTransport;
let session: Session;

beforeEach(async () => {
	transport = new InMemoryTransport(server);
	session = transport.session();
	await session.initialize(
		'2025-11-25',
		{},
		{
			name: 'test-client',
			version: '1.0.0',
		},
	);
});

describe('npm-i-checker', () => {
	it('is an available tool', async () => {
		const tools = await session.listTools();
		expect(tools.tools).toContainEqual(
			expect.objectContaining({
				name: 'npm-i-checker',
			}),
		);
	});

	describe.each(['npm', 'pnpm', 'yarn', 'bun'])(
		'using "%s" package manager',
		(package_manager) => {
			// these are all the alias of `npm i`...they technically don't work with other package managers but we literally don't even check this
			// the test is just here to make sure that we at least support all the common aliases of `install`
			describe.each([
				'add',
				'a',
				'i',
				'in',
				'ins',
				'inst',
				'insta',
				'instal',
				'isnt',
				'isnta',
				'isntal',
				'isntall',
			])('using alias "%s"', (alias) => {
				it("doesn't suggest anything for packages that don't have replacements", async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} svelte`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [],
					});
				});

				it('provides documentations for packages that have package replacements', async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} chalk`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [
							expect.stringContaining(
								"Don't use `chalk` instead read the following document:",
							),
						],
					});
				});

				it("provides documentations for packages that have package replacements even if there's a flag after", async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} chalk --save-dev`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [
							expect.stringContaining(
								"Don't use `chalk` instead read the following document:",
							),
						],
					});
				});

				it("provides documentations for packages that have package replacements even if there's a flag before", async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} -w chalk`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [
							expect.stringContaining(
								"Don't use `chalk` instead read the following document:",
							),
						],
					});
				});

				it('provides documentations for packages that have micro utilities replacements', async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} arr-diff`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [
							"Don't use `arr-diff` instead `const difference = (a, b) => a.filter((item) => !b.includes(item))`",
						],
					});
				});

				it('provides documentations for multiple packages skipping the non problematic one', async () => {
					const tool = await session.callTool('npm-i-checker', {
						command: `${package_manager} ${alias} arr-diff svelte chalk`,
					});

					expect(tool.structuredContent).toEqual({
						suggestions: [
							"Don't use `arr-diff` instead `const difference = (a, b) => a.filter((item) => !b.includes(item))`",
							expect.stringContaining(
								"Don't use `chalk` instead read the following document:",
							),
						],
					});
				});
			});
		},
	);
});

describe('code-checker', () => {
	it('is an available tool', async () => {
		const tools = await session.listTools();
		expect(tools.tools).toContainEqual(
			expect.objectContaining({
				name: 'code-checker',
			}),
		);
	});

	it("doesn't suggest anything for packages that don't have replacements", async () => {
		const tool = await session.callTool('code-checker', {
			code: `import { onMount } from 'svelte';`,
		});

		expect(tool.structuredContent).toEqual({
			suggestions: [],
		});
	});

	it('provides documentations for packages that have package replacements', async () => {
		const tool = await session.callTool('code-checker', {
			code: `import chalk from 'chalk';
			
console.log(chalk.blue('Hello world!'));`,
		});

		expect(tool.structuredContent).toEqual({
			suggestions: [
				expect.stringContaining(
					"Don't use `chalk` instead read the following document:",
				),
			],
		});
	});

	it('provides documentations for packages that have micro utilities replacements', async () => {
		const tool = await session.callTool('code-checker', {
			code: `import diff from 'arr-diff';
			
const a = ['a', 'b', 'c', 'd'];
const b = ['b', 'c'];
 
console.log(diff(a, b));`,
		});

		expect(tool.structuredContent).toEqual({
			suggestions: [
				"Don't use `arr-diff` instead `const difference = (a, b) => a.filter((item) => !b.includes(item))`",
			],
		});
	});

	it('provides documentations for multiple packages skipping the non problematic one', async () => {
		const tool = await session.callTool('code-checker', {
			code: `import chalk from 'chalk';
import { onMount } from 'svelte';
import diff from 'arr-diff';

onMount(()=>{
	const a = ['a', 'b', 'c', 'd'];
	const b = ['b', 'c'];
	 
	console.log(diff(a, b));
});
`,
		});

		expect(tool.structuredContent).toEqual({
			suggestions: [
				expect.stringContaining(
					"Don't use `chalk` instead read the following document:",
				),
				"Don't use `arr-diff` instead `const difference = (a, b) => a.filter((item) => !b.includes(item))`",
			],
		});
	});
});

describe('lookup-replacement', () => {
	it('is an available tool', async () => {
		const tools = await session.listTools();
		expect(tools.tools).toContainEqual(
			expect.objectContaining({
				name: 'lookup-replacement',
			}),
		);
	});

	it("doesn't return anything for empty queries", async () => {
		const tool = await session.callTool('lookup-replacement', {
			query: '   ',
		});

		expect(tool.structuredContent).toEqual({
			results: [],
		});
	});

	it('finds preferred package replacements by package name', async () => {
		const tool = await session.callTool('lookup-replacement', {
			query: 'chalk',
		});

		expect(tool.structuredContent).toEqual({
			results: expect.arrayContaining([
				expect.objectContaining({
					source: 'preferred',
					module_name: 'chalk',
					type: 'documented',
					documentation: expect.stringContaining('chalk'),
				}),
			]),
		});
	});

	it('finds micro utility replacements by replacement text', async () => {
		const tool = await session.callTool('lookup-replacement', {
			query: 'includes',
		});

		expect(tool.structuredContent).toEqual({
			results: expect.arrayContaining([
				expect.objectContaining({
					source: 'micro-utility',
					module_name: 'arr-diff',
					replacement:
						'`const difference = (a, b) => a.filter((item) => !b.includes(item))`',
				}),
			]),
		});
	});

	it('finds native replacements by package name', async () => {
		const tool = await session.callTool('lookup-replacement', {
			query: 'array-includes',
		});

		expect(tool.structuredContent).toEqual({
			results: expect.arrayContaining([
				expect.objectContaining({
					source: 'native',
					module_name: 'array-includes',
					replacement: 'Array.prototype.includes',
					url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes',
				}),
			]),
		});
	});
});
