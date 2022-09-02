import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  outDir: './lib',
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
})
