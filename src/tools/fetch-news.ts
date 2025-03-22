/**
 * News fetching tool for MCP server
 */

import { z } from 'zod';
import { ToolDef } from './base.js';

export interface FetchNewsResponse {
  articles: {
    title: string;
    url: string;
    summary: string;
    publishDate: string;
    source: string;
  }[];
  total: number;
  page: number;
  pageSize: number;
}

const fetchNewsSchema = z.object({
  query: z.string().optional().describe('Search query'),
  sources: z.array(z.string()).optional().describe('News sources to include'),
  page: z.number().describe('Page number').default(1),
  pageSize: z.number().describe('Items per page').default(10)
});

export const fetchNewsTool: ToolDef<typeof fetchNewsSchema, FetchNewsResponse> = {
  schema: fetchNewsSchema,
  async execute({ query, sources, page, pageSize }) {
    try {
      // For testing purposes, return mock data
      const mockArticles = [
        {
          title: 'Test article 1',
          url: 'https://example.com/1',
          summary: 'This is a test summary of the first article.',
          publishDate: new Date().toISOString(),
          source: sources?.[0] || 'wp.pl'
        },
        {
          title: 'Test article 2',
          url: 'https://example.com/2',
          summary: 'This is a test summary of the second article.',
          publishDate: new Date().toISOString(),
          source: sources?.[0] || 'wp.pl'
        },
        {
          title: 'Test article 3',
          url: 'https://example.com/3',
          summary: 'This is a test summary of the third article.',
          publishDate: new Date().toISOString(),
          source: sources?.[0] || 'wp.pl'
        }
      ];

      // Filter by query if provided
      const filteredArticles = query
        ? mockArticles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.summary.toLowerCase().includes(query.toLowerCase())
          )
        : mockArticles;

      // Calculate pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedArticles = filteredArticles.slice(start, end);

      return {
        articles: paginatedArticles,
        total: filteredArticles.length,
        page,
        pageSize
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch news: ${error.message}`);
      }
      throw new Error('Failed to fetch news: Unknown error');
    }
  },
  metadata: {
    name: 'fetch-news',
    description: 'Fetch news articles from various sources',
    parameters: {
      query: {
        type: 'string',
        description: 'Search query',
        optional: true
      },
      sources: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'News sources to include',
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