import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-config-prettier';

export default withNuxt(
  {
    ignores: ['.output/**', 'dist/**', 'playwright-report/**', 'test-results/**'],
  },
  prettier,
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/block-lang': ['error', { script: { lang: 'ts' }, style: { lang: 'scss' } }],
      'vue/padding-line-between-blocks': ['error', 'always'],
    },
  },
);
