import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables for the test
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get GitHub token from environment
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
    console.error('GITHUB_TOKEN environment variable is required for testing');
    process.exit(1);
}

async function main() {
    // Create a transport that connects to the server and passes the token
    const transport = new StdioClientTransport({
        command: 'node',
        args: [path.join(__dirname, 'server.js'), githubToken as string]
    });

    // Create a client
    const client = new Client(
        {
            name: 'test-client',
            version: '1.0.0'
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    try {
        // Connect to the server
        await client.connect(transport);
        console.log('Connected to server');

        // Call the get_pr_comments tool
        const result = await client.callTool({
            name: 'get_pr_comments',
            arguments: {
                owner: 'octocat',
                repo: 'Hello-World',
                pull_number: 1
            }
        });

        console.log('Tool result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error); 