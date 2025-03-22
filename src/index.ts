/**
 * MCP Server for Transcripter project
 */

// Re-export core functionality from MCP SDK
export { Server } from "@modelcontextprotocol/sdk/server/index.js";
export { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
export { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Re-export web server dependencies
export { default as express } from "express";
export { default as cors } from "cors";

// Export our custom MCP tools and resources
export { tools } from './tools/index.js';
export { resourceProviders } from './resources/index.js';

// Re-export everything from tools and resources
export * from './tools/index.js';
export * from './resources/index.js';