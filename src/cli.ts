import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import cors from "cors";
import logger from "./logger.js";

// Import our tools and resources
import { tools } from "./tools/index.js";
import { resourceProviders } from "./resources/index.js";

async function runServer(port: number | null) {
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

  if (port !== null) {
    const app = express();
    app.use(cors());

    let servers: Server[] = [];

    app.get("/sse", async (req, res) => {
      logger.info("Got new SSE connection");

      const transport = new SSEServerTransport("/message", res);
      const server = new Server(
        {
          name: "transcripter-mcp-server",
          version: "1.0.0",
        },
        {
          capabilities,
        },
      );

      servers.push(server);

      server.onclose = () => {
        logger.info("SSE connection closed");
        servers = servers.filter((s) => s !== server);
      };

      await server.connect(transport);
    });

    app.post("/message", async (req, res) => {
      logger.info("Received message");

      const sessionId = req.query.sessionId as string;
      const transport = servers
        .map((s) => s.transport as SSEServerTransport)
        .find((t) => t.sessionId === sessionId);
      if (!transport) {
        res.status(404).send("Session not found");
        return;
      }

      await transport.handlePostMessage(req, res);
    });

    app.listen(port, () => {
      logger.info(`MCP Server running on http://localhost:${port}/sse`);
      logger.info(`Available tools: ${Object.keys(tools).join(", ")}`);
      logger.info(`Available resource schemes: ${Object.keys(resourceProviders).join(", ")}`);
    });
  } else {
    const server = new Server(
      {
        name: "transcripter-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities,
      },
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info("Server running on stdio");
    logger.info(`Available tools: ${Object.keys(tools).join(", ")}`);
    logger.info(`Available resource schemes: ${Object.keys(resourceProviders).join(", ")}`);
  }
}

const args = process.argv.slice(2);
const command = args[0];
switch (command) {
  case "server": {
    const port = args[1] ? parseInt(args[1]) : 3500;
    runServer(port).catch((error) => {
      logger.error(error);
      process.exit(1);
    });
    break;
  }

  default:
    logger.error("Unrecognized command:", command);
    logger.info("Usage: npm run server [port]");
}