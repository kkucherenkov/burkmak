import { build, context } from 'esbuild';
import builtinModules from 'builtin-modules';

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/main.ts'],
  outfile: 'main.js',
  format: 'cjs',
  platform: 'node',
  target: 'es2020',
  bundle: true,
  external: ['obsidian', 'electron', ...builtinModules],
  sourcemap: isProd ? false : 'inline',
  logLevel: 'info',
};

if (isWatch) {
  const ctx = await context(options);
  await ctx.watch();
  console.warn('Watching for changes…');
} else {
  await build(options);
}
