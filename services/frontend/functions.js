const { Octokit } = require("@octokit/rest");

// Initialize Octokit with your GitHub access token
const octokit = new Octokit({ auth: "<YOUR_GITHUB_ACCESS_TOKEN>" });

// Cloud function to create an issue in a private GitHub repository
exports.createGitHubIssue = async (req, res) => {
  try {
    // Extract the necessary data from the request body
    const { owner, repo, title, body } = req.body;

    // Create the issue using the Octokit API
    const response = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
    });

    // Return the created issue data as the response
    res.status(201).json(response.data);
  } catch (err) {
    // Handle any errors that occur during the process
    console.error("Error creating GitHub issue:", err);
    res.status(500).send("Failed to create GitHub issue.");
  }
};
