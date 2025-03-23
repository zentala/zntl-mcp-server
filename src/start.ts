import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import logger from "./logger.js";

// Import our tools and resources
import { tools } from "./tools/index.js";
import { resourceProviders } from "./resources/index.js";

// Server information
const serverInfo = {
  name: "transcripter-mcp-server",
  version: "1.0.0"
};

// Prepare server capabilities with our tools and resources
const capabilities = {
  prompts: {},
  resources: {},
  tools: {},
  logging: {},
};

// Register all tools
Object.entries(tools).forEach(([name, tool]) => {
  capabilities.tools[name] = async (params: any) => {
    logger.info(`Executing tool: ${name}`, params);
    try {
      const result = await tool.execute(params);
      logger.info(`Tool ${name} executed successfully`);
      return result;
    } catch (error) {
      logger.error(`Error executing tool ${name}:`, error);
      throw error;
    }
  };
});

// Register all resource providers
Object.entries(resourceProviders).forEach(([scheme, provider]) => {
  capabilities.resources[scheme] = async (uri: string) => {
    logger.info(`Resolving resource: ${uri}`);
    try {
      const result = await provider.getResource(uri);
      if (result) {
        logger.info(`Resource ${uri} resolved successfully`);
      } else {
        logger.info(`Resource ${uri} not found`);
      }
      return result;
    } catch (error) {
      logger.error(`Error resolving resource ${uri}:`, error);
      return null;
    }
  };
});

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create a single server instance
const server = new Server(serverInfo, { capabilities });

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// SSE endpoint
app.get("/sse", async (req, res) => {
  try {
    logger.info("Got new SSE connection");
    logger.info(`Client IP: ${req.ip}`);
    logger.info(`User Agent: ${req.get('user-agent')}`);

    const transport = new SSEServerTransport("/message", res);

    server.onclose = () => {
      logger.info("SSE connection closed");
      logger.info(`Client IP: ${req.ip}`);
    };

    await server.connect(transport);
  } catch (error) {
    logger.error('Error in SSE endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Message endpoint
app.post("/message", async (req, res) => {
  try {
    logger.info("Received message");
    logger.info(`Client IP: ${req.ip}`);
    logger.info(`Message Type: ${req.query.type || 'unknown'}`);
    logger.info(`Message Body:`, req.body);

    const sessionId = req.query.sessionId as string;
    const transport = server.transport as SSEServerTransport;
    
    if (!transport || transport.sessionId !== sessionId) {
      logger.error(`Session not found: ${sessionId}`);
      res.status(404).send("Session not found");
      return;
    }

    logger.info(`Processing message for session: ${sessionId}`);
    await transport.handlePostMessage(req, res);
    logger.info(`Message processed successfully for session: ${sessionId}`);
  } catch (error) {
    logger.error('Error in message endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic info endpoint
app.get("/", (req, res) => {
  try {
    logger.info("Info endpoint accessed");
    logger.info(`Client IP: ${req.ip}`);
    
    res.json({
      name: serverInfo.name,
      version: serverInfo.version,
      capabilities: {
        tools: Object.keys(tools),
        resources: Object.keys(resourceProviders)
      }
    });
  } catch (error) {
    logger.error('Error in info endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start the server
const port = 3501;
const httpServer = app.listen(port, () => {
  logger.info("===============================================");
  logger.info(`MCP Server started successfully!`);
  logger.info(`Server Name: ${serverInfo.name}`);
  logger.info(`Version: ${serverInfo.version}`);
  logger.info(`Port: ${port}`);
  logger.info(`SSE Endpoint: http://localhost:${port}/sse`);
  logger.info(`Message Endpoint: http://localhost:${port}/message`);
  logger.info(`Info Endpoint: http://localhost:${port}/`);
  logger.info("Available Tools:");
  Object.keys(tools).forEach(tool => logger.info(`  - ${tool}`));
  logger.info("Available Resources:");
  Object.keys(resourceProviders).forEach(resource => logger.info(`  - ${resource}`));
  logger.info("===============================================");
});

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
}); 