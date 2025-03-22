/**
 * Transcription summary tool for MCP server
 */

import { z } from 'zod';
import { ToolDef } from './base.js';

export interface TranscriptionSummaryResponse {
  summary: string;
  keyPoints?: string[];
  topics?: string[];
}

const transcriptionSummarySchema = z.object({
  transcriptionId: z.number().describe('ID of the transcription to summarize'),
  model: z.string().describe('AI model to use for summarization').default('gpt-4'),
  options: z.object({
    extractKeyPoints: z.boolean().describe('Whether to extract key points').default(false),
    extractTopics: z.boolean().describe('Whether to extract topics').default(false)
  }).optional()
});

export const transcriptionSummaryTool: ToolDef<typeof transcriptionSummarySchema, TranscriptionSummaryResponse> = {
  schema: transcriptionSummarySchema,
  async execute({ transcriptionId, model, options }) {
    try {
      // Build URL
      const url = new URL(`http://localhost:3500/api/transcriptions/${transcriptionId}/summary`);
      
      // Add parameters
      url.searchParams.append('model', model);
      if (options?.extractKeyPoints) {
        url.searchParams.append('extractKeyPoints', 'true');
      }
      if (options?.extractTopics) {
        url.searchParams.append('extractTopics', 'true');
      }
      
      // Execute request
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return {
        summary: data.summary,
        keyPoints: data.keyPoints,
        topics: data.topics
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate summary: ${error.message}`);
      }
      throw new Error('Failed to generate summary: Unknown error');
    }
  },
  metadata: {
    name: 'transcription-summary',
    description: 'Generate a summary of a transcription using AI',
    parameters: {
      transcriptionId: {
        type: 'number',
        description: 'ID of the transcription to summarize'
      },
      model: {
        type: 'string',
        description: 'AI model to use for summarization',
        default: 'gpt-4'
      },
      options: {
        type: 'object',
        description: 'Additional summarization options',
        properties: {
          extractKeyPoints: {
            type: 'boolean',
            description: 'Whether to extract key points',
            default: false
          },
          extractTopics: {
            type: 'boolean',
            description: 'Whether to extract topics',
            default: false
          }
        }
      }
    }
  }
};