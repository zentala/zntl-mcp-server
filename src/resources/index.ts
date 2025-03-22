/**
 * Export all MCP resource providers
 */

import { TranscriptionResourceProvider } from './transcription.js';
import { AnalysisResourceProvider } from './analysis.js';

// Re-export all resource providers
export {
  TranscriptionResourceProvider,
  AnalysisResourceProvider,
};

// Export a record of all available resource providers
export const resourceProviders = {
  'transcription': new TranscriptionResourceProvider(),
  'analysis': new AnalysisResourceProvider(),
};