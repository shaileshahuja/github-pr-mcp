import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { GitHubService } from './github-service.js';
import { GetPRCommentsParams } from './types.js';

// Parse command-line arguments
let githubToken: string | undefined = process.argv[2]; // Get token from command-line arguments

// If no token provided via command line, try loading from .env file
if (!githubToken) {
    // Load environment variables
    dotenv.config();
    githubToken = process.env.GITHUB_TOKEN;
}

// Check if we have a token from either source
if (!githubToken) {
    console.error('GitHub token is required. Provide it as a command-line argument or set GITHUB_TOKEN environment variable.');
    process.exit(1);
}

// Create GitHub service
const githubService = new GitHubService(githubToken);

// Create MCP server
const server = new McpServer({
    name: 'github-pr-comments',
    version: '1.0.0',
    description: 'MCP server that fetches GitHub Pull Request comments'
});

// Register tool to fetch PR comments
// @ts-ignore - Ignoring type error for now as the MCP SDK types seem to be incompatible
server.tool(
    'get_pr_comments',
    {
        owner: z.string().min(1).describe('Repository owner (username or organization)'),
        repo: z.string().min(1).describe('Repository name'),
        pull_number: z.number().int().positive().describe('Pull request number')
    },
    async (args: { owner: string; repo: string; pull_number: number }) => {
        try {
            const params: GetPRCommentsParams = {
                owner: args.owner,
                repo: args.repo,
                pull_number: args.pull_number
            };

            const comments = await githubService.getPRComments(params);

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: JSON.stringify({ comments }, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error('Error in get_pr_comments tool:', error);
            throw error;
        }
    },
    {
        description: 'Fetches comments from a GitHub pull request with their file paths, line ranges, and replies'
    }
);

// Start the server with StdioServerTransport
async function startServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('MCP server started with StdioServerTransport');
    } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}

startServer(); 