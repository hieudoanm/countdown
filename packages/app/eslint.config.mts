import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'build/**',
    'mobile/**',
    'out/**',
    'src-tauri/**',
    'jest.config.ts',
    'jest.setup.ts',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
