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
  method: z.string().describe('HTTP method to use').default('GET')
});

export const testApiTool: ToolDef<typeof testApiSchema, TestApiResponse> = {
  schema: testApiSchema,
  async execute({ endpoint, method }) {
    try {
      // Build URL
      const url = new URL(`http://localhost:3000/api/${endpoint}`);
      
      // Execute request
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      return {
        status: response.status,
        data
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
    description: 'Test API endpoints and return the results',
    parameters: {
      endpoint: {
        type: 'string',
        description: 'API endpoint to test'
      },
      method: {
        type: 'string',
        description: 'HTTP method to use',
        default: 'GET'
      }
    }
  }
};