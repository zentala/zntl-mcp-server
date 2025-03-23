import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { TestServer } from "./utils/test-server.js";
import { z } from "zod";

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type for server info response
interface ServerInfo {
  name: string;
  version: string;
  capabilities: {
    resources: string[];
  };
  port: number;
}

describe('Client Test', () => {
  let serverInfo: ServerInfo;
  let testServer: TestServer;

  beforeAll(async () => {
    serverInfo = {
      name: "test-server",
      version: "1.0.0",
      capabilities: {
        resources: []
      },
      port: 3501
    };

    console.log('🚀 Uruchamianie serwera testowego...');
    testServer = new TestServer(serverInfo.port);
    await testServer.start();

    console.log('⏳ Czekam 2 sekundy na pełne uruchomienie serwera...');
    await wait(2000);
  });

  afterAll(async () => {
    console.log('🛑 Zatrzymywanie serwera testowego...');
    await testServer.stop();
  });

  it('should connect to the server', async () => {
    const sseUrl = new URL(`http://localhost:${serverInfo.port}/sse`);
    const transport = new SSEClientTransport(sseUrl);

    transport.onmessage = (message) => {
      console.log('📨 Otrzymano wiadomość:', message);
    };

    transport.onerror = (error) => {
      console.error('❌ Błąd transportu:', error);
    };

    transport.onclose = () => {
      console.log('🔒 Transport zamknięty');
    };

    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    });

    console.log('🔌 Łączenie z serwerem MCP...');
    await client.connect(transport);

    // Inicjalizacja klienta
    const initResponse = await client.request({
      method: "initialize",
      params: {
        roots: []
      }
    }, z.object({
      serverInfo: z.object({
        name: z.string(),
        version: z.string()
      })
    }));

    expect(initResponse).toBeDefined();
    expect(initResponse.serverInfo.name).toBe('test-mcp-server');

    await wait(1000); // Give some time for connection to establish

    console.log('🛑 Zamykanie połączenia...');
    await client.close();
  });
}); 