/** @type {import('prettier').Config} */
// Export Prettier configuration
export default {
  // Maximum characters per line
  printWidth: 120,
  // Use single quotes
  singleQuote: true,
  // Disable automatic line breaks
  proseWrap: 'never',
  // Configuration for specific files
  overrides: [
    {
      // All JSON files
      files: '**/*.json',
      options: {
        // Use JSON parser
        parser: 'json-stringify',
      },
    },
    {
      // VSCode configuration files and tsconfig.json
      files: ['.vscode/*.json', '**/tsconfig.json'],
      options: {
        // Use JSONC parser (JSON with comments)
        parser: 'jsonc',
      },
    },
  ],
};
