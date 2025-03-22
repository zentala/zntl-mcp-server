/**
 * Transcription search tool for MCP server
 */

import { z } from 'zod';
import { ToolDef } from './base.js';

export interface TranscriptionSearchResponse {
  results: any[];
  total: number;
  page: number;
  pageSize: number;
}

const transcriptionSearchSchema = z.object({
  query: z.string().optional().describe('Search query'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  page: z.number().describe('Page number').default(1),
  pageSize: z.number().describe('Items per page').default(10)
});

export const transcriptionSearchTool: ToolDef<typeof transcriptionSearchSchema, TranscriptionSearchResponse> = {
  schema: transcriptionSearchSchema,
  async execute({ query, tags, page, pageSize }) {
    try {
      // Build search URL
      const url = new URL('http://localhost:3500/api/transcriptions');
      
      // Add search parameters
      if (query) {
        url.searchParams.append('q', query);
      }
      
      if (tags && tags.length > 0) {
        url.searchParams.append('tags', tags.join(','));
      }
      
      url.searchParams.append('page', String(page));
      url.searchParams.append('pageSize', String(pageSize));
      
      // Execute search
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return {
        results: data.results,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search transcriptions: ${error.message}`);
      }
      throw new Error('Failed to search transcriptions: Unknown error');
    }
  },
  metadata: {
    name: 'transcription-search',
    description: 'Search transcriptions with filtering and pagination',
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        optional: true
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Filter by tags',
        optional: true
      },
      page: {
        type: 'number',
        description: 'Page number',
        default: 1
      },
      pageSize: {
        type: 'number',
        description: 'Items per page',
        default: 10
      }
    }
  }
};