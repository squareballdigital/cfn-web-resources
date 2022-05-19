import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import builtin from 'builtin-modules';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const DEBUGGING = !!process.env.DEBUGGING;
const external = [...builtin];

export default {
  input: 'lib/index.js',

  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    sourcemap: true,
  },

  plugins: [
    resolve({
      exportConditions: ['node'],
    }),
    commonjs(),
    json(),
    sourcemaps(),
    !DEBUGGING &&
      terser({
        output: {
          comments: false,
        },
      }),
  ].filter(Boolean),

  external: (id) => external.includes(id),
};
