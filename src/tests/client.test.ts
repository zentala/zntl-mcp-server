import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

describe('MCP Client E2E Tests', () => {
  let client: Client;
  let transport: SSEClientTransport;

  beforeAll(async () => {
    console.log('Inicjalizacja klienta MCP...');
    
    transport = new SSEClientTransport(
      new URL("http://localhost:3501/sse"),
      {
        requestInit: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }
    );

    client = new Client(
      {
        name: "e2e-test-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    console.log('Łączenie z serwerem MCP...');
    await client.connect(transport);
    console.log('Połączono z serwerem MCP');
  });

  test('powinien wykonać pełny przepływ testowy', async () => {
    // Test API
    console.log('Testowanie test-api...');
    const testResult = await client.callTool({
      name: 'test'
    });
  });
}); 