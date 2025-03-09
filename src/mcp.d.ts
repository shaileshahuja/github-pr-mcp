declare module '@modelcontextprotocol/sdk/server/mcp.js' {
    import { z } from 'zod';

    export class McpServer {
        constructor(options: { name: string; version: string; description?: string });

        tool(
            name: string,
            schema: Record<string, z.ZodType<any, any, any>>,
            handler: (args: any) => Promise<any>,
            options?: { description?: string }
        ): void;

        connect(transport: any): Promise<void>;
    }

    export class ResourceTemplate {
        constructor(template: string, options: { list: undefined });
    }
} 