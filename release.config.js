export default {
  dryRun: false,
  debug: false,
  branches: ['main'],
  plugins: [
    [
      './tools/semantic-release/commit-analyzer.js',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        // Disable eslint rule for template literals
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
  ],
};
