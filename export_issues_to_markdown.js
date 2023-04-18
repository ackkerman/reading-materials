const fs = require('fs');
const Github = require('github-api');
const markdownTable = require('markdown-table');

(async () => {
  const github = new Github({
    token: process.env.GITHUB_TOKEN
  });

  const repo = github.getRepo(process.env.GITHUB_REPOSITORY);

  const issues = await repo.listIssues({state: 'all', per_page: 100});
  const issueData = issues.data.map(issue => [issue.number, issue.title, issue.state]);

  const table = markdownTable([['#', 'Title', 'State'], ...issueData]);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const outputPath = `docs/issues_${year}_${month}.md`;

  fs.writeFileSync(outputPath, table);
})();
