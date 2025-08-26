import { analyzeCommits as DEFAULT_analyzeCommits } from '@semantic-release/commit-analyzer';
import { minimatch } from 'minimatch';
import { execSync } from 'node:child_process';

const ChangeTypesMap = {
  A: 'added',
  C: 'copied',
  D: 'deleted',
  M: 'modified',
  R: 'renamed',
};

const ALLOW_RELEASE_PATTERNS = ['src/**/*', 'README.md'];

function getGitChangedFiles(commit) {
  const result = execSync(`git diff-tree --no-commit-id --name-status --diff-filter=ACDMR -r ${commit}`, {
    encoding: 'utf-8',
  });

  return result
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((el) => {
      const [type, filepath] = el.split(/\s+/);
      return { type: ChangeTypesMap[type], filepath };
    });
}

/**
 *
 * @param {*} pluginConfig
 * @param {import('semantic-release').AnalyzeCommitsContext} context
 */
export async function analyzeCommits(pluginConfig, context) {
  // Filter commits with no source changes
  const commits = context.commits.filter((commit) => {
    const changedFiles = getGitChangedFiles(commit.hash);
    const hasReleaseFilesChange = changedFiles.some((file) => {
      return ALLOW_RELEASE_PATTERNS.some((pattern) => minimatch(file.filepath, pattern));
    });
    return hasReleaseFilesChange;
  });
  context.commits = commits;

  return DEFAULT_analyzeCommits(pluginConfig, context);
}
