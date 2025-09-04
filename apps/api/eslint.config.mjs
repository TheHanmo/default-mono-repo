import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/', 'node_modules/', 'coverage/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // 1. Node.js 내장 모듈
            ['^node:', '^fs', '^path', '^os', '^crypto', '^util'],

            // 2. 외부 라이브러리 (npm packages)
            ['^@?\\w'],

            // 3. NestJS 관련
            ['^@nestjs'],

            // 4. 프로젝트 alias (우선순위대로 나열)
            ['^@common/'],
            ['^@types/'],
            ['^@utils/'],
            ['^@config/'],
            ['^@modules/'],

            // 5. 상대 경로 import
            ['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\./?$'],

            // 6. 스타일 import
            ['^.+\\.s?css$'],

            // 7. 최종 fallback (필요 시)
            ['^'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'prettier/prettier': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
    },
  },
);
