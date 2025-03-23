// Mock winston
jest.mock('winston', () => {
  const mFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
    json: jest.fn()
  };
  const mTransports = {
    Console: jest.fn(),
    File: jest.fn()
  };
  return {
    format: mFormat,
    transports: mTransports,
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    })
  };
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;
global.fetch.mockResolvedValue = (value) => mockFetch.mockImplementation(() => Promise.resolve(value));
global.fetch.mockRejectedValue = (value) => mockFetch.mockImplementation(() => Promise.reject(value));

// Mock node-fetch
jest.mock('node-fetch', () => {
  return jest.fn().mockImplementation(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
  }));
});

// Mock @modelcontextprotocol/sdk
jest.mock('@modelcontextprotocol/sdk', () => {
  const mockServer = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  }));

  const mockSSEServerTransport = jest.fn().mockImplementation(() => ({
    handlePostMessage: jest.fn(),
    sessionId: 'test-session'
  }));

  const mockClient = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    tools: {
      execute: jest.fn(),
      list: jest.fn()
    },
    resources: {
      get: jest.fn(),
      list: jest.fn()
    }
  }));

  const mockSSEClientTransport = jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn()
  }));

  return {
    Server: mockServer,
    SSEServerTransport: mockSSEServerTransport,
    Client: mockClient,
    SSEClientTransport: mockSSEClientTransport
  };
}); 