/**
 * @type {import('semantic-release').Options}
 */
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
      './tools/semantic-release/release-notes-generator.js',
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
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        // eslint-disable-next-line no-template-curly-in-string
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
  ],
};
