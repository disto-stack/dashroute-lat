import { defineConfig } from 'eslint/config';
import { baseConfig } from './base.js';

export const nestConfig = defineConfig([
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
]);

export default nestConfig;

