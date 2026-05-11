'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code2, FileCode, Terminal } from 'lucide-react'

interface UsageExamplesProps {
  owner: string
  repo: string
  name: string
  isRemote?: boolean
  endpoint?: string | null
}

export function UsageExamples({ owner, repo, name, isRemote, endpoint }: UsageExamplesProps) {
  const npmPackage = `@${owner}/${repo}`

  const typescriptExample = `import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "${npmPackage}"]
});

const client = new Client({ name: "my-app", version: "1.0.0" });
await client.connect(transport);

// List available tools/resources
const tools = await client.listTools();
console.log(tools);`

  const pythonExample = `from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="npx",
    args=["-y", "${npmPackage}"]
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        
        # List available tools
        tools = await session.list_tools()
        print(tools)`

  const claudeConfig = isRemote && endpoint ? `{
  "mcpServers": {
    "${name.toLowerCase().replace(/\\s+/g, '-')}": {
      "url": "${endpoint}"
    }
  }
}` : `{
  "mcpServers": {
    "${name.toLowerCase().replace(/\\s+/g, '-')}": {
      "command": "npx",
      "args": ["-y", "${npmPackage}"]
    }
  }
}`

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          Примеры использования
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="typescript">
          <TabsList className="mb-4">
            <TabsTrigger value="typescript" className="gap-1.5">
              <FileCode className="h-4 w-4" />
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="python" className="gap-1.5">
              <Terminal className="h-4 w-4" />
              Python
            </TabsTrigger>
            <TabsTrigger value="claude" className="gap-1.5">
              <Code2 className="h-4 w-4" />
              Claude Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="typescript" className="mt-0">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{typescriptExample}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={typescriptExample} label="TS" size="sm" variant="ghost" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-0">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{pythonExample}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={pythonExample} label="PY" size="sm" variant="ghost" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="claude" className="mt-0">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{claudeConfig}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={claudeConfig} label="JSON" size="sm" variant="ghost" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
