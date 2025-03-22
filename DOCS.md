# Model Context Protocol (MCP) Documentation

This document provides practical examples and usage guidelines for developing with the Model Context Protocol (MCP) using the TypeScript SDK.

## Table of Contents

- [Introduction to MCP](#introduction-to-mcp)
- [Setting Up an MCP Server](#setting-up-an-mcp-server)
- [Working with Resources](#working-with-resources)
- [Implementing Tools](#implementing-tools)
- [Creating Prompts](#creating-prompts)
- [Transport Mechanisms](#transport-mechanisms)
- [Advanced Usage](#advanced-usage)
- [Integration with Transcripter](#integration-with-transcripter)
- [Test Tools](#test-tools)
- [Testing](#testing)

## Introduction to MCP

The Model Context Protocol (MCP) is a standardized protocol for LLM applications to communicate with external tools and data sources. It provides a structured way for AI models to access and work with:

- **Resources**: Data sources that provide content (similar to GET endpoints)
- **Tools**: Executable functions that can perform actions (similar to POST endpoints)
- **Prompts**: Reusable templates for LLM interactions

## Setting Up an MCP Server

### Basic Server Setup

```typescript
import { Server } from "@modelcontextprotocol/sdk/dist/esm/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/dist/esm/server/stdio.js";

// Create a server instance
const server = new Server({
  name: "transcripter-mcp-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});

// Configure transport
const transport = new StdioServerTransport();

// Connect the server to the transport
await server.connect(transport);
```

### HTTP Server with SSE

```typescript
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/dist/esm/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/dist/esm/server/sse.js";
import logger from './logger.js';

// Create server instance
const server = new Server({
  name: "transcripter-mcp-server",
  version: "1.0.0"
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
```

## Working with Resources

Resources in MCP provide data to LLMs, similar to GET endpoints in REST APIs.

### Static Resources

```typescript
// Register a static resource
server.resource(
  "config",                // Resource name
  "config://app/settings", // Resource URI
  async (uri) => ({        // Read callback
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        appName: "Transcripter",
        version: "1.0.0",
        settings: {
          defaultLanguage: "en-US",
          maxTranscriptionLength: 3600
        }
      }, null, 2)
    }]
  })
);
```

### Dynamic Resources with Templates

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Register a parameterized resource
server.resource(
  "transcription",  // Resource name
  new ResourceTemplate("transcription://{id}", {
    list: async () => ({
      resources: [
        { uri: "transcription://1", name: "First Transcription" },
        { uri: "transcription://2", name: "Second Transcription" },
      ]
    }),
    complete: {
      id: async (value) => ["1", "2", "3"]  // Autocomplete for {id} parameter
    }
  }),
  async (uri, variables) => {
    const id = variables.id;
    return {
      contents: [{
        uri: uri.href,
        text: `Content of transcription ${id}`
      }]
    };
  }
);
```

## Implementing Tools

Tools let LLMs take actions through your server, similar to POST endpoints in REST APIs.

### Simple Tool without Parameters

```typescript
// Register a simple tool that takes no parameters
server.tool(
  "get-time",
  "Returns the current server time",
  async () => ({
    content: [{ 
      type: "text", 
      text: new Date().toISOString() 
    }]
  })
);
```

### Tool with Parameter Validation

```typescript
import { z } from "zod";

// Register a tool with parameter validation
server.tool(
  "analyze-text",
  "Analyzes the sentiment of text",
  {
    text: z.string().min(1).describe("The text to analyze"),
    language: z.enum(["en", "fr", "de"]).optional().describe("Language code")
  },
  async ({ text, language }) => {
    // Perform sentiment analysis
    const sentiment = analyzeSentiment(text, language || "en");
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(sentiment, null, 2) 
      }]
    };
  }
);
```

### Tool with External API Call

```typescript
server.tool(
  "transcribe-audio",
  "Transcribes audio file from a URL",
  {
    audioUrl: z.string().url(),
    language: z.string().default("en-US")
  },
  async ({ audioUrl, language }) => {
    try {
      // Call hypothetical transcription API
      const transcript = await callTranscriptionAPI(audioUrl, language);
      
      return {
        content: [{ 
          type: "text", 
          text: transcript 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error: ${error.message}` 
        }],
        isError: true
      };
    }
  }
);
```

## Creating Prompts

Prompts are reusable templates for LLM interactions.

### Simple Prompt

```typescript
// Register a simple prompt with no parameters
server.prompt(
  "greeting",
  "A friendly greeting prompt",
  () => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: "Hello! How can I help you with transcription today?"
      }
    }]
  })
);
```

### Prompt with Parameters

```typescript
// Register a prompt with parameters
server.prompt(
  "transcribe-instructions",
  "Instructions for transcribing audio",
  {
    language: z.string().describe("Language of the audio"),
    contentType: z.enum(["interview", "lecture", "meeting"]).describe("Type of content")
  },
  ({ language, contentType }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please transcribe the following ${contentType} audio in ${language}. 
               Focus on accuracy and include speaker identification if possible.`
      }
    }]
  })
);
```

## Transport Mechanisms

MCP supports different transport mechanisms for communication.

### stdio Transport

Ideal for command-line applications and direct integrations:

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Server-Sent Events (SSE) Transport

Ideal for web applications and remote scenarios:

```typescript
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// In Express route handler
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});
```

## Advanced Usage

### Handling Errors

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

server.tool(
  "process-data",
  {
    data: z.string()
  },
  async ({ data }) => {
    try {
      // Process data
      const result = processData(data);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      // Return error in MCP format
      return {
        content: [{ 
          type: "text", 
          text: error instanceof Error ? error.message : String(error)
        }],
        isError: true
      };
    }
  }
);
```

### Custom Server Configuration

```typescript
const server = new McpServer(
  {
    name: "transcripter-mcp-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
      logging: {}
    }
  }
);
```

## Integration with Transcripter

### Setting Up MCP for Audio Transcription

```typescript
// Tool to initiate transcription
server.tool(
  "start-transcription",
  "Starts a new audio transcription job",
  {
    audioFileId: z.string(),
    language: z.string().default("en-US"),
    model: z.enum(["standard", "enhanced"]).default("standard")
  },
  async ({ audioFileId, language, model }) => {
    // Integration with Transcripter core functionality
    const jobId = await transcriptionService.startJob(audioFileId, { 
      language, 
      model 
    });
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({ jobId, status: "started" })
      }]
    };
  }
);

// Resource to access transcription results
server.resource(
  "transcription-result",
  new ResourceTemplate("transcription-result://{jobId}", {
    list: async () => ({
      resources: await transcriptionService.getCompletedJobs()
        .map(job => ({ 
          uri: `transcription-result://${job.id}`, 
          name: job.name 
        }))
    })
  }),
  async (uri, variables) => {
    const jobId = variables.jobId;
    const result = await transcriptionService.getResult(jobId);
    
    return {
      contents: [{
        uri: uri.href,
        text: result.text,
        metadata: {
          duration: result.duration,
          speakerCount: result.speakerCount,
          confidence: result.confidence
        }
      }]
    };
  }
);
```

## Test Tools

### Test API tool for testing endpoints
server.tool(
  "test-api",
  "Test API endpoints and return the results",
  {
    endpoint: z.string().describe("API endpoint to test"),
    method: z.string().describe("HTTP method to use").default("GET")
  },
  async ({ endpoint, method }) => {
    try {
      const url = new URL(`http://localhost:3000/api/${endpoint}`);
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      return {
        status: response.status,
        data
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
);

// News fetching tool with pagination
server.tool(
  "fetch-news",
  "Fetch news articles from various sources",
  {
    query: z.string().optional().describe("Search query"),
    sources: z.array(z.string()).optional().describe("News sources to include"),
    page: z.number().describe("Page number").default(1),
    pageSize: z.number().describe("Items per page").default(10)
  },
  async ({ query, sources, page, pageSize }) => {
    // Implementation with pagination and filtering
    const articles = await fetchNewsArticles(query, sources);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      articles: articles.slice(start, end),
      total: articles.length,
      page,
      pageSize
    };
  }
);

## Testing

### Server Tests

```typescript
import { Server } from "@modelcontextprotocol/sdk/dist/cjs/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/dist/cjs/server/sse.js";
import express from "express";
import request from "supertest";

describe('MCP Server with SSE', () => {
  let app;
  let server;
  let transport;
  
  beforeEach(() => {
    app = express();
    server = new Server({
      name: "test-mcp-server",
      version: "1.0.0"
    });
    
    // SSE endpoint
    app.get('/sse', async (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      transport = new SSEServerTransport("/messages", res);
      await server.connect(transport);
    });
    
    // Message endpoint
    app.post('/messages', async (req, res) => {
      if (!transport) {
        res.status(400).json({ error: 'No active SSE connection' });
        return;
      }
      
      try {
        await transport.handlePostMessage(req, res);
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
  
  it('should establish SSE connection', async () => {
    const response = await request(app)
      .get('/sse')
      .expect('Content-Type', /text\/event-stream/)
      .expect(200);
  });
  
  it('should handle messages with active SSE connection', async () => {
    // First establish SSE connection
    await request(app).get('/sse');
    
    // Then send a message
    const response = await request(app)
      .post('/messages')
      .send({ 
        jsonrpc: '2.0',
        method: 'ping',
        id: 1
      })
      .expect(200);
      
    expect(response.body).toHaveProperty('jsonrpc', '2.0');
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('result');
  });
});
```

### Tool Tests

```typescript
import { testApiTool } from '../src/tools/test-api';
import { fetchNewsTool } from '../src/tools/fetch-news';

describe('Test API Tool', () => {
  it('should handle successful API calls', async () => {
    const result = await testApiTool.execute({
      endpoint: 'test',
      method: 'GET'
    });
    
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('data');
  });
  
  it('should handle API errors gracefully', async () => {
    const result = await testApiTool.execute({
      endpoint: 'nonexistent',
      method: 'GET'
    });
    
    expect(result.status).toBe(500);
    expect(result.data).toHaveProperty('error');
  });
});

describe('Fetch News Tool', () => {
  it('should return paginated results', async () => {
    const result = await fetchNewsTool.execute({
      page: 1,
      pageSize: 2
    });
    
    expect(result).toHaveProperty('articles');
    expect(result.articles).toHaveLength(2);
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('pageSize');
  });
  
  it('should filter results by query', async () => {
    const result = await fetchNewsTool.execute({
      query: 'test',
      page: 1,
      pageSize: 10
    });
    
    expect(result.articles.every(article => 
      article.title.toLowerCase().includes('test') ||
      article.summary.toLowerCase().includes('test')
    )).toBe(true);
  });
});
```

This documentation provides practical examples and guidance for using the Model Context Protocol TypeScript SDK in your Transcripter project. For more details, refer to the [official MCP documentation](https://modelcontextprotocol.io) and the [MCP specification](https://spec.modelcontextprotocol.io).