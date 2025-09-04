import { generateNotes as DEFAULT_generateNotes } from '@semantic-release/release-notes-generator';

import { filterReleasableCommits } from './_internal/commit-filter.js';

/**
 *
 * @param {*} pluginConfig
 * @param {import('semantic-release').AnalyzeCommitsContext} context
 */
export async function generateNotes(pluginConfig, context) {
  // filter no src changed commits
  const commits = filterReleasableCommits(context.commits);
  context.commits = commits;

  return DEFAULT_generateNotes(pluginConfig, context);
}
