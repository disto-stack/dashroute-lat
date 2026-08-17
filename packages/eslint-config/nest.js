import tseslint from 'typescript-eslint';
import { baseConfig } from './base.js';

/**
 * NestJS-specific ESLint 9 Flat Config for DashRoute microservices.
 */
export const nestConfig = tseslint.config(...baseConfig, {
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
  },
});

export default nestConfig;
