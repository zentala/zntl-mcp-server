import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { tools } from "../tools/index.js";
import { resourceProviders } from "../resources/index.js";
import request from 'supertest';
import express from 'express';

// Type definitions for capabilities
interface Capabilities {
  prompts: Record<string, any>;
  resources: Record<string, any>;
  tools: Record<string, any>;
  logging: Record<string, any>;
  [key: string]: any; // Add index signature for compatibility
}

describe('Server', () => {
  let server: Server;
  let app: express.Application;
  let transport: SSEServerTransport | undefined;
  const PORT = 3501;

  beforeEach(() => {
    console.log('🔄 Inicjalizacja serwera testowego...');
    app = express();
    server = new Server({
      name: "test-mcp-server",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    // SSE endpoint
    app.get('/sse', async (req, res) => {
      console.log('📡 Nowe połączenie SSE');
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      transport = new SSEServerTransport("/messages", res);
      await server.connect(transport);
      console.log('✅ Połączenie SSE ustanowione');
    });

    // Message endpoint
    app.post('/messages', async (req, res) => {
      if (!transport) {
        console.log('⚠️ Brak aktywnego połączenia SSE');
        res.status(400).json({ error: 'No active SSE connection' });
        return;
      }
      
      try {
        await transport.handlePostMessage(req, res);
        console.log('✅ Wiadomość przetworzona');
      } catch (error) {
        console.error('❌ Błąd podczas przetwarzania wiadomości:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Basic info endpoint
    app.get('/', (req, res) => {
      console.log('📊 Żądanie informacji o serwerze');
      res.json({
        name: "test-mcp-server",
        version: "1.0.0",
        capabilities: {
          tools: Object.keys(tools),
          resources: Object.keys(resourceProviders)
        }
      });
      console.log('✅ Informacje o serwerze wysłane');
    });
  });

  afterEach(() => {
    console.log('🧹 Czyszczenie po teście...');
    transport = undefined;
  });

  test('should handle SSE connections', async () => {
    console.log('🔄 Test połączenia SSE...');
    const response = await request(app)
      .get('/sse')
      .set('Accept', 'text/event-stream')
      .expect(200);

    expect(response.headers['content-type']).toBe('text/event-stream');
    console.log('✅ Test połączenia SSE zakończony');
  });

  test('should return server info', async () => {
    console.log('🔄 Test endpointu informacyjnego...');
    const response = await request(app)
      .get('/')
      .expect(200);

    const data = response.body;
    expect(data.name).toBe('test-mcp-server');
    expect(data.version).toBe('1.0.0');
    expect(data.capabilities.tools).toBeDefined();
    expect(data.capabilities.resources).toBeDefined();
    console.log('✅ Test endpointu informacyjnego zakończony');
  });

  test('should handle message endpoint without SSE connection', async () => {
    console.log('🔄 Test endpointu message bez połączenia SSE...');
    const response = await request(app)
      .post('/messages')
      .send({ method: 'test' })
      .expect(400);

    expect(response.body.error).toBe('No active SSE connection');
    console.log('✅ Test endpointu message zakończony');
  });

  it('should create server instance', () => {
    const serverInfo = {
      name: "transcripter-mcp-server",
      version: "1.0.0",
    };
    
    const server = new Server(
      serverInfo,
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
          logging: {},
        },
      },
    );
    
    expect(server).toBeDefined();
    // Since info property might be private or not directly accessible, 
    // we'll just verify the server instance exists
    expect(server).toBeInstanceOf(Server);
  });
  
  it('should register all tools and resources', () => {
    // Create capabilities object
    const capabilities: Capabilities = {
      prompts: {},
      resources: {},
      tools: {},
      logging: {},
    };
    
    // Register tools
    Object.entries(tools).forEach(([name, tool]) => {
      capabilities.tools[name] = async (params: any) => {
        return await tool.execute(params);
      };
    });
    
    // Register resource providers
    Object.entries(resourceProviders).forEach(([scheme, provider]) => {
      capabilities.resources[scheme] = async (uri: string) => {
        return await provider.getResource(uri);
      };
    });
    
    // Create server with capabilities
    const server = new Server(
      {
        name: "transcripter-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities,
      },
    );
    
    // Verify tools and resources are registered correctly
    expect(Object.keys(capabilities.tools)).toContain('test-api');
    expect(Object.keys(capabilities.tools)).toContain('transcription-search');
    expect(Object.keys(capabilities.tools)).toContain('transcription-summary');
    
    expect(Object.keys(capabilities.resources)).toContain('transcription');
    expect(Object.keys(capabilities.resources)).toContain('analysis');
    
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(Server);
  });
});