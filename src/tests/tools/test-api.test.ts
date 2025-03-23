/**
 * Tests for the test-api tool
 */
import { testApiTool } from '../../tools/test-api.js';
import { jest } from '@jest/globals';

const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe('test-api tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have the correct metadata', () => {
    expect(testApiTool.metadata).toEqual({
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
    });
  });
  
  test('should execute GET requests correctly', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' })
    };
    
    mockFetch.mockResolvedValue(mockResponse as Response);
    
    const result = await testApiTool.execute({
      endpoint: 'transcriptions',
      method: 'GET'
    });
    
    // Check the fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transcriptions',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      })
    );
    
    // Check the result
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ data: 'test' });
  });
  
  test('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    };
    
    mockFetch.mockResolvedValue(mockResponse as Response);
    
    const result = await testApiTool.execute({
      endpoint: 'invalid',
      method: 'GET'
    });
    
    // Check the result
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'Not found' });
  });
  
  test('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    const result = await testApiTool.execute({
      endpoint: 'transcriptions',
      method: 'GET'
    });
    
    // Check the result
    expect(result.status).toBe(500);
    expect(result.data).toEqual({ error: 'Network error' });
  });

  test('should execute POST requests with data correctly', async () => {
    const mockResponse = {
      ok: true,
      status: 201,
      json: async () => ({ id: '123', success: true })
    };

    mockFetch.mockResolvedValue(mockResponse as Response);

    const testData = {
      name: 'Test Transcription',
      content: 'Hello world'
    };

    const result = await testApiTool.execute({
      endpoint: 'transcriptions',
      method: 'POST',
      data: testData
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transcriptions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(testData)
      })
    );

    expect(result.status).toBe(201);
    expect(result.data).toEqual({ id: '123', success: true });
  });
});