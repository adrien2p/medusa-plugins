import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/cjs/index.js',
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: 'dist/esm/index.js',
				format: 'esm',
				sourcemap: true,
			},
		],
		plugins: [peerDepsExternal(), resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
		external: ['react', 'react-dom', 'styled-components', 'lodash'],
	},
	{
		input: './dist/esm/index.d.ts',
		output: [{ file: 'dist/types/types.d.ts', format: 'es' }],
		plugins: [dts()],
	},
];
