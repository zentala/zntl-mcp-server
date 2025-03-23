import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { tools } from "../../tools/index.js";
import { resourceProviders } from "../../resources/index.js";
import cors from 'cors';

export class TestServer {
  private app: express.Application;
  private server: Server;
  private httpServer: any;
  private transport: SSEServerTransport | undefined;
  private port: number;

  constructor(port: number = 3501) {
    this.port = port;
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    // Create server instance
    this.server = new Server({
      name: "test-mcp-server",
      version: "1.0.0"
    }, {
      capabilities: {
        tools,
        resources: resourceProviders
      }
    });

    // SSE endpoint
    this.app.get('/sse', async (req, res) => {
      console.log('📡 Nowe połączenie SSE');
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Send endpoint header
      const endpoint = `http://localhost:${this.port}/message`;
      res.write(`event: endpoint\ndata: ${endpoint}\n\n`);

      this.transport = new SSEServerTransport("/message", res);
      await this.server.connect(this.transport);
      console.log('✅ Połączenie SSE ustanowione');

      req.on('close', () => {
        console.log('🔒 Połączenie SSE zamknięte');
        this.transport = undefined;
      });
    });

    // Message endpoint
    this.app.post('/message', async (req, res) => {
      if (!this.transport) {
        console.log('⚠️ Brak aktywnego połączenia SSE');
        res.status(400).json({ error: 'No active SSE connection' });
        return;
      }
      
      try {
        await this.transport.handlePostMessage(req, res);
        console.log('✅ Wiadomość przetworzona');
      } catch (error) {
        console.error('❌ Błąd podczas przetwarzania wiadomości:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Basic info endpoint
    this.app.get('/', (req, res) => {
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
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = this.app.listen(this.port, () => {
        console.log(`🚀 Serwer testowy uruchomiony na porcie ${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close((err: any) => {
          if (err) {
            console.error('❌ Błąd podczas zatrzymywania serwera:', err);
            reject(err);
          } else {
            console.log('✅ Serwer testowy zatrzymany');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
} 