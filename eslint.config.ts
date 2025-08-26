// Import ESLint configuration tool
import antfu from '@antfu/eslint-config';
// Import ESLint rules recommended by Prettier
import prettierRecommend from 'eslint-plugin-prettier/recommended';

// Export ESLint configuration
// Based on antfu's configuration with custom rules
export default antfu(
  {
    // Ignore directories and files
    ignores: ['.github', 'package.json'],
    // Disable style checks
    stylistic: false,
    // Disable Markdown file checks
    markdown: false,
    // TypeScript related configurations
    typescript: {
      overrides: {
        // Allow comments like @ts-ignore
        'ts/ban-ts-comment': 'off',
        // Allow duplicate declarations
        'ts/no-redeclare': 'off',
      },
    },
  },
  {
    // Custom rules
    rules: {
      // Enforce specific import sorting rules
      'perfectionist/sort-imports': [
        'error',
        {
          // Import grouping rules
          groups: [
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'side-effect',
            'object',
            'unknown',
          ],
          // Empty lines between groups
          newlinesBetween: 1,
          // Sorting order
          order: 'asc',
          // Sorting type
          type: 'natural',
        },
      ],
    },
  },
  // Integrate Prettier recommended rules
  prettierRecommend,
);
