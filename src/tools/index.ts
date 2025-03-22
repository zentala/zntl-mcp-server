/**
 * Export all MCP tools
 */

import { testApiTool } from './test-api.js';
import { transcriptionSummaryTool } from './transcription-summary.js';
import { transcriptionSearchTool } from './transcription-search.js';
import { fetchNewsTool } from './fetch-news.js';
import { analyzeNewsTool } from './analyze-news.js';

// Re-export all tools
export {
  testApiTool,
  transcriptionSummaryTool,
  transcriptionSearchTool,
  fetchNewsTool,
  analyzeNewsTool,
};

// Export a record of all available tools
export const tools = {
  'test-api': testApiTool,
  'transcription-summary': transcriptionSummaryTool,
  'transcription-search': transcriptionSearchTool,
  'fetch-news': fetchNewsTool,
  'analyze-news': analyzeNewsTool,
};