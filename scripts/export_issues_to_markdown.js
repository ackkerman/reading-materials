const fs = require('fs');
const fetch = require('node-fetch-commonjs')

// Get all issues: GET | https://api.github.com/repos/{owner}/{repository}/issues
// {
//  "url": "xxx",
//  "repository_url": "xxx"
//  "comments_url": "xxx",
//  "id": XXXXXX,
//  "number": X,
//  "title": "xxxxxxx"
//  "created_at": "2023-04-18T17:35:22Z",
//  "updated_at": "2023-04-18T17:41:44Z",
//  ...
// }

// Get all issues' comments: GET | https://api.github.com/repos/{owner}/{repository}/issues/{issue-number}/comments
// {
//  "url": "xxx",
//  "html_url": "xxx"
//  "issue_url": "xxx",
//  "id": XXXXXX,
//  "body": "xxxxxxx"
//  "created_at": "2023-04-18T17:35:22Z",
//  "updated_at": "2023-04-18T17:41:44Z",
//  ...
// }

// Function to send GET request to given url and print response to console.
const sendGetRequest = async (url) => {
  return await fetch(url)
          .then(res => res.json())
          .catch(err => console.log(err));
}

const GITHUB_REPO_NAME = 'reading-materials';
const GITHUB_REPO_OWNER = 'moxak';
const GITHUB_ISSUES_ENDPOINT = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`;

// TODO: Generate file for only new issues

// Main function
(async () => {
  // Get all issues from repository
  const allIssues = await sendGetRequest(GITHUB_ISSUES_ENDPOINT);

  // Process each issue
  await Promise.all(allIssues.map(async issue => {

    // Get issue's metadata
    const issue_url = issue.url;
    const issue_title = issue.title;
    const issue_commnets_url  = issue.comments_url;

    // / sv-SE: YYYY-MM-DD HH:MM:SS
    const issue_created_at = new Date(issue.created_at)
                              .toLocaleString('sv-SE');
    const issue_updated_at = new Date(issue.updated_at)
                              .toLocaleString('sv-SE');
    
    // Get all issue's comments
    const allComments = await sendGetRequest(issue_commnets_url);
    
    // Export body content from comments
    const issue_body = allComments.map(comment => {
      let comment_body = comment.body;
      
      // Get comment's metadata
      const comment_url = comment.html_url;
      const comment_created_at = new Date(comment.created_at)
                                    .toLocaleString('sv-SE');
      const comment_updated_at = new Date(comment.updated_at)
                                    .toLocaleString('sv-SE');

      // Extract title(includs ## line) from body
      const comment_title = comment_body.split('\n')[0];
      comment_body = comment_body.replace(comment_title, '');

      // Create header include "Title", "Created At", "Updateed At", and "Url"
      const comment_header = `${comment_title}\n\n- Created At: ${comment_created_at}\n- Updated At: ${comment_updated_at}\n- Url: ${comment_url}\n\n`;

      // Create markdown file
      return comment_header + comment_body;
    }).join('\n\n');

    // Create header include "Title", "Created At", "Updateed At", and "Url"
    const issue_header = `# ${issue_title}\n\n- Created At: ${issue_created_at}\n- Updated At: ${issue_updated_at}\n- Url: ${issue_url}\n\n`;
    
    // Create markdown file
    // replace "/" to "-" and remove "Weekly Readings - " from title"
    const fileName = issue_title.replace(/\//g, '-').replace("Weekly Readings - ", "");
    const outputPath = 'docs/' + fileName + '.md';
    fs.writeFileSync(outputPath, issue_header + issue_body);
    
    console.log(`Created ${outputPath}`);
  }));

  console.log('Done!');
})();
