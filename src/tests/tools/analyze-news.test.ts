/**
 * Tests for the analyze-news tool
 */
import { analyzeNewsTool } from '../../tools/analyze-news.js';

describe('analyze-news tool', () => {
  // Mock content for testing
  const mockContent = `
    Test news item 1: This is a political article about important matters.
    Test news item 2: Sports event coverage of the latest match.
    Test news item 3: Another political piece discussing current events.
  `;

  it('should have the correct metadata', () => {
    expect(analyzeNewsTool.metadata.name).toBe('analyze-news');
    expect(analyzeNewsTool.metadata.parameters).toHaveProperty('content');
    expect(analyzeNewsTool.metadata.parameters).toHaveProperty('model');
  });
  
  it('should analyze content with default model', async () => {
    const result = await analyzeNewsTool.execute({
      content: mockContent,
      model: 'gpt-3.5-turbo'
    });
    
    // Check the result
    expect(result.summary).toBeDefined();
    expect(result.sentiment).toBeDefined();
    expect(result.topics).toBeDefined();
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.entities).toBeDefined();
    expect(result.entities).toBeInstanceOf(Array);
  });
  
  it('should analyze content with different model', async () => {
    const result = await analyzeNewsTool.execute({
      content: mockContent,
      model: 'gpt-4'
    });
    
    // Check the result
    expect(result.summary).toBeDefined();
    expect(result.sentiment).toBeDefined();
    expect(result.topics).toBeDefined();
    expect(result.topics).toBeInstanceOf(Array);
    expect(result.entities).toBeDefined();
    expect(result.entities).toBeInstanceOf(Array);
  });
  
  it('should handle empty content gracefully', async () => {
    const result = await analyzeNewsTool.execute({
      content: '',
      model: 'gpt-3.5-turbo'
    });
    
    // Even with empty input, it should return a valid response
    expect(result.summary).toBeDefined();
    expect(result.sentiment).toBeDefined();
    expect(result.topics).toBeDefined();
    expect(result.entities).toBeDefined();
  });
});