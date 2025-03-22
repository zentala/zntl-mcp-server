# MCP Server for Transcripter

A Model Context Protocol (MCP) server implementation for the Transcripter project. This package provides tools and resources for AI-powered features using the MCP standard.

## Features

### Tools

- **test-api**: Test API endpoints and return the results
- **transcription-search**: Search transcriptions with filtering and pagination
- **transcription-summary**: Generate a summary of a transcription using AI

### Resources

- **transcription://{id}**: Access transcription data by ID
- **analysis://{id}**: Access analysis data by ID

## Requirements

- Node.js >= 18.0.0
- npm >= 7.0.0

## Installation

```bash
npm install
```

## Building

```bash
# Build for both ESM and CommonJS
npm run build

# Build for ESM only
npm run build:esm

# Build for CommonJS only
npm run build:cjs
```

## Running

```bash
# Start the MCP server on the default port (3500)
npm run server

# Start the MCP server on a custom port
npm run server 4000
```

## Testing

```bash
npm test
```

## Usage Examples

### Using the test-api tool

```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

async function testApiEndpoint() {
  // Connect to the MCP server
  const transport = new SSEClientTransport("http://localhost:3500/sse", "http://localhost:3500/message");
  const client = new Client();
  await client.connect(transport);
  
  // Use the test-api tool
  const result = await client.tools.execute("test-api", {
    endpoint: "transcriptions",
    method: "GET",
  });
  
  console.log(result);
}
```

### Using the transcription resource

```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

async function getTranscription(id: number) {
  // Connect to the MCP server
  const transport = new SSEClientTransport("http://localhost:3500/sse", "http://localhost:3500/message");
  const client = new Client();
  await client.connect(transport);
  
  // Access the transcription resource
  const transcription = await client.resources.get(`transcription://${id}`);
  
  console.log(transcription);
}
```

## Integration with Transcripter

This MCP server integrates with the Transcripter project to provide AI-powered features for transcriptions and analyses. It serves as a standardized interface for AI model interactions.

## Project Structure

- `src/cli.ts`: Command-line interface for starting the MCP server
- `src/tools/`: Implementation of MCP tools
- `src/resources/`: Implementation of MCP resource providers
- `src/tests/`: Tests for tools and resources

## License

MIT