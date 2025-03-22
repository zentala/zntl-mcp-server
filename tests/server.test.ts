const express = require('express');
const request = require('supertest');
const { Server } = require('../../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/index.js');
const { SSEServerTransport } = require('../../node_modules/@modelcontextprotocol/sdk/dist/cjs/server/sse.js');
const eventsource = require('eventsource');

describe('MCP Server with SSE', () => {
  let app;
  let server;
  let transport;
  const serverConfig = {
    name: "test-mcp-server",
    version: "1.0.0"
  };

  beforeEach(() => {
    app = express();
    server = new Server(serverConfig, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });
    transport = null;

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

    // Basic info endpoint
    app.get('/', (req, res) => {
      res.json({
        name: serverConfig.name,
        version: serverConfig.version,
        capabilities: {
          tools: {},
          resources: {}
        }
      });
    });
  });

  afterEach(() => {
    if (transport) {
      transport = null;
    }
  });

  it('should return server info on root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      name: serverConfig.name,
      version: serverConfig.version,
      capabilities: {
        tools: {},
        resources: {}
      }
    });
  });

  it('should establish SSE connection', (done) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const es = new eventsource(`http://localhost:${port}/sse`);

      es.onopen = () => {
        es.close();
        server.close(done);
      };

      es.onerror = (error) => {
        es.close();
        server.close(() => done(error));
      };
    });
  });

  it('should reject messages without SSE connection', async () => {
    const response = await request(app)
      .post('/messages')
      .send({ type: 'test' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({
      error: 'No active SSE connection'
    });
  });

  it('should handle messages with active SSE connection', (done) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      const es = new eventsource(`http://localhost:${port}/sse`);

      es.onopen = async () => {
        try {
          const response = await request(app)
            .post('/messages')
            .send({ 
              jsonrpc: '2.0',
              method: 'ping',
              id: 1
            })
            .expect('Content-Type', /json/)
            .expect(200);

          expect(response.body).toHaveProperty('jsonrpc', '2.0');
          expect(response.body).toHaveProperty('id', 1);
          expect(response.body).toHaveProperty('result');

          es.close();
          server.close(done);
        } catch (error) {
          es.close();
          server.close(() => done(error));
        }
      };

      es.onerror = (error) => {
        es.close();
        server.close(() => done(error));
      };
    });
  });
}); 