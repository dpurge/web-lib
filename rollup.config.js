import { readdirSync } from "node:fs"
import { sveltePreprocess } from 'svelte-preprocess'
import { toKebabCase } from "@std/text/to-kebab-case"

import css from "rollup-plugin-css-only"
import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import terser from "@rollup/plugin-terser"
import typescript from '@rollup/plugin-typescript'

const isProd = process.env.NODE_ENV === "production"

const components = readdirSync("src/lib")

export default [

  ...components.map((name) => ({
    input: `src/lib/${name}/index.ts`,
    output: {
      dir: "dist",
      entryFileNames: `${toKebabCase(name)}.js`,
      format: "es",
      name,
      sourcemap: true,
    },
    plugins: [
      svelte({
        compilerOptions: { runes: true },
        extensions: ['.svelte'],
        include: "src/lib/**/*.svelte",
        preprocess: sveltePreprocess(),
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      css({
        output: `${toKebabCase(name)}.css`
      }),
      resolve({
        browser: true,
        exportConditions: ["svelte"],
        extensions: ['.svelte']
      }),
      isProd && terser(),
    ],
  })),
  
]