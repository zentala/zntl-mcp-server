/**
 * Tests for the test-api tool
 */
import { testApiTool } from '../../tools/test-api.js';

// Tests will use the globally mocked fetch function from jest.setup.js

describe('test-api tool', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.resetAllMocks();
  });

  it('should have the correct metadata', () => {
    expect(testApiTool.metadata.name).toBe('test-api');
    expect(testApiTool.metadata.parameters).toHaveProperty('endpoint');
    expect(testApiTool.metadata.parameters).toHaveProperty('method');
  });
  
  it('should execute GET requests correctly', async () => {
    // Mock a successful response
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: 'test data' }),
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await testApiTool.execute({
      endpoint: 'transcriptions',
      method: 'GET',
    });
    
    // Check the fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/transcriptions',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }),
      })
    );
    
    // Check the result
    expect(result.status).toBe(200);
    expect(result.data).toEqual({ data: 'test data' });
  });
  
  it('should handle API errors', async () => {
    // Mock an error response
    const mockResponse = {
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ error: 'Not found' }),
    };
    
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    
    const result = await testApiTool.execute({
      endpoint: 'invalid',
      method: 'GET',
    });
    
    // Check the result
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'Not found' });
  });
  
  it('should handle network errors', async () => {
    // Mock a network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const result = await testApiTool.execute({
      endpoint: 'transcriptions',
      method: 'GET',
    });
    
    // Check the result
    expect(result.status).toBe(500);
    expect(result.data).toEqual({ error: 'Network error' });
  });
});