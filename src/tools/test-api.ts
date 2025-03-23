/**
 * Test API tool for MCP server
 */

import { z } from 'zod';
import { ToolDef } from './base.js';

export interface TestApiResponse {
  status: number;
  data: any;
}

const testApiSchema = z.object({
  endpoint: z.string().describe('API endpoint to test'),
  method: z.string().describe('HTTP method to use').optional().default('GET'),
  data: z.any().describe('Data to send with the request').optional()
});

export const testApiTool: ToolDef<typeof testApiSchema, TestApiResponse> = {
  schema: testApiSchema,
  async execute({ endpoint, method, data }) {
    try {
      // Build URL - ensure endpoint starts with /api/
      const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const apiPath = apiEndpoint.startsWith('/api/') ? apiEndpoint : `/api${apiEndpoint}`;
      const url = new URL(`http://localhost:3000${apiPath}`);
      
      // Prepare request options
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Add body if data is provided
      if (data !== undefined) {
        options.body = JSON.stringify(data);
      }
      
      // Execute request
      const response = await fetch(url.toString(), options);
      
      const responseData = await response.json();
      
      return {
        status: response.status,
        data: responseData
      };
    } catch (error) {
      return {
        status: 500,
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  },
  metadata: {
    name: 'test-api',
    description: 'Tool for testing API endpoints',
    parameters: {
      endpoint: {
        type: 'string',
        description: 'API endpoint to test'
      },
      method: {
        type: 'string',
        description: 'HTTP method to use',
        optional: true
      },
      data: {
        type: 'object',
        description: 'Data to send with the request',
        optional: true
      }
    }
  }
};