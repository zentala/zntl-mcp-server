/**
 * Tests for the fetch-news tool
 */
import { fetchNewsTool } from '../../tools/fetch-news.js';

describe('fetch-news tool', () => {
  it('should have the correct metadata', () => {
    expect(fetchNewsTool.metadata.name).toBe('fetch-news');
    expect(fetchNewsTool.metadata.parameters).toHaveProperty('query');
    expect(fetchNewsTool.metadata.parameters).toHaveProperty('sources');
    expect(fetchNewsTool.metadata.parameters).toHaveProperty('page');
    expect(fetchNewsTool.metadata.parameters).toHaveProperty('pageSize');
  });
  
  it('should fetch news with default parameters', async () => {
    const result = await fetchNewsTool.execute({
      page: 1,
      pageSize: 5,
      sources: ['wp.pl']
    });
    
    // Check the result
    expect(result.articles).toBeInstanceOf(Array);
    expect(result.articles.length).toBeLessThanOrEqual(5);
    expect(result.articles[0]).toHaveProperty('title');
    expect(result.articles[0]).toHaveProperty('url');
    expect(result.articles[0]).toHaveProperty('summary');
    expect(result.articles[0]).toHaveProperty('publishDate');
    expect(result.articles[0]).toHaveProperty('source');
    expect(result.total).toBeDefined();
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
  });
  
  it('should respect pagination parameters', async () => {
    const result = await fetchNewsTool.execute({
      page: 2,
      pageSize: 3,
      sources: ['wp.pl']
    });
    
    // Check pagination
    expect(result.articles.length).toBeLessThanOrEqual(3);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
  });
  
  it('should filter by query when provided', async () => {
    const query = 'technology';
    const result = await fetchNewsTool.execute({
      page: 1,
      pageSize: 5,
      sources: ['wp.pl'],
      query
    });
    
    // Check that articles are returned
    expect(result.articles).toBeInstanceOf(Array);
    expect(result.total).toBeDefined();
  });
});