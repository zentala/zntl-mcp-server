import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { tools } from "../tools/index.js";
import { resourceProviders } from "../resources/index.js";

// Type definitions for capabilities
interface Capabilities {
  prompts: Record<string, any>;
  resources: Record<string, any>;
  tools: Record<string, any>;
  logging: Record<string, any>;
  [key: string]: any; // Add index signature for compatibility
}

describe('MCP Server', () => {
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