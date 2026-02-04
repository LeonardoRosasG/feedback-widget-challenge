import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

// Configuración compartida
const typescriptPlugin = typescript({
  tsconfig: './tsconfig.json',
  declaration: false, // Lo manejamos por separado
});

export default [
  // ESM build (para bundlers: Vite, Webpack, etc.)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/feedback-widget.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [resolve(), typescriptPlugin],
  },
  
  // CommonJS build (para Node.js / require())
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/feedback-widget.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [resolve(), typescriptPlugin],
  },
  
  // UMD build (para <script> tag - desarrollo)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/feedback-widget.umd.js',
      format: 'umd',
      name: 'FeedbackWidget',
      sourcemap: true,
    },
    plugins: [resolve(), typescriptPlugin],
  },
  
  // UMD build minificado (para <script> tag - producción)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/feedback-widget.umd.min.js',
      format: 'umd',
      name: 'FeedbackWidget',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescriptPlugin,
      production && terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      }),
    ].filter(Boolean),
  },
];