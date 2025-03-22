/**
 * MCP server with SSE transport
 */
import express from 'express';
import { Server } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js";
import { SSEServerTransport } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/server/sse.js";
import logger from './dist/esm/logger.js';

// Server information
const serverInfo = {
  name: "transcripter-mcp-server",
  version: "1.0.0"
};

// Create MCP server instance
const server = new Server({
  name: serverInfo.name,
  version: serverInfo.version
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Create Express app
const app = express();
let transport;

// SSE endpoint
app.get('/sse', async (req, res) => {
  logger.info('New SSE connection established');
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Create transport for this connection
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
  
  // Handle client disconnect
  req.on('close', () => {
    logger.info('SSE connection closed');
  });
});

// Message endpoint for client->server communication
app.post('/messages', async (req, res) => {
  if (!transport) {
    res.status(400).json({ error: 'No active SSE connection' });
    return;
  }
  
  try {
    await transport.handlePostMessage(req, res);
  } catch (error) {
    logger.error('Error handling message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    name: serverInfo.name,
    version: serverInfo.version,
    capabilities: {
      tools: ["test-api", "transcription-search", "transcription-summary"],
      resources: ["transcription", "analysis"]
    }
  });
});

// Start the server
const port = 3501;
app.listen(port, () => {
  logger.info(`MCP Server running on http://localhost:${port}/sse`);
});