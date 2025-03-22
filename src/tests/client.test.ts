import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

describe('MCP Client E2E Tests', () => {
  let client: Client;
  let transport: SSEClientTransport;

  beforeAll(async () => {
    console.log('🔄 Inicjalizacja klienta MCP...');
    
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

    // Dodajemy handlery eventów dla transportu
    transport.onmessage = (msg) => {
      console.log('📥 Otrzymano wiadomość:', JSON.stringify(msg, null, 2));
    };

    transport.onerror = (error) => {
      console.error('❌ Błąd transportu:', error);
    };

    transport.onclose = () => {
      console.log('🔒 Połączenie zamknięte');
    };

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

    console.log('🔌 Łączenie z serwerem MCP...');
    await client.connect(transport);
    console.log('✅ Połączono z serwerem MCP');

    // Pobierz informacje o serwerze
    const serverInfo = await client.info;
    console.log('ℹ️ Informacje o serwerze:', JSON.stringify(serverInfo, null, 2));
  });

  test('powinien wykonać pełny przepływ testowy', async () => {
    // Test API
    console.log('🧪 Testowanie test-api...');
    const testResult = await client.callTool({
      name: 'test-api',
      arguments: {
        endpoint: 'test',
        method: 'GET'
      }
    });
    console.log('📤 Wynik test-api:', JSON.stringify(testResult, null, 2));
  });

  afterAll(async () => {
    console.log('🛑 Zamykanie połączenia...');
    await transport.close();
    console.log('👋 Test zakończony');
  });
}); 