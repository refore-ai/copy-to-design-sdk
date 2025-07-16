import antfu from '@antfu/eslint-config';
import prettierRecommend from 'eslint-plugin-prettier/recommended';

export default antfu(
  {
    ignores: ['.github', 'package.json'],
    stylistic: false,
    markdown: false,
    typescript: {
      overrides: {
        'ts/ban-ts-comment': 'off',
        'ts/no-redeclare': 'off',
      },
    },
  },
  {
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'object',
            'unknown',
          ],
          newlinesBetween: 1,
          order: 'asc',
          type: 'natural',
        },
      ],
    },
  },
  prettierRecommend,
);
