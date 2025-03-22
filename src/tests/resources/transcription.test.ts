/**
 * Tests for the transcription resource provider
 */
import { TranscriptionResourceProvider } from '../../resources/transcription';

describe('TranscriptionResourceProvider', () => {
  let provider: TranscriptionResourceProvider;

  beforeEach(() => {
    provider = new TranscriptionResourceProvider();
  });

  it('should parse valid transcription URIs', async () => {
    const resource = await provider.getResource('transcription://123');
    
    expect(resource).not.toBeNull();
    expect(resource?.id).toBe(123);
    expect(resource?.content).toBeDefined();
    expect(resource?.language).toBe('en');
  });

  it('should return null for invalid URIs', async () => {
    const invalidUris = [
      'invalid://123',
      'transcription://',
      'transcription://abc',
      'transcription://123/extra',
    ];
    
    for (const uri of invalidUris) {
      const resource = await provider.getResource(uri);
      expect(resource).toBeNull();
    }
  });

  it('should return a complete resource object', async () => {
    const resource = await provider.getResource('transcription://456');
    
    expect(resource).toMatchObject({
      id: 456,
      audioFileId: expect.any(Number),
      content: expect.any(String),
      language: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      metadata: expect.any(Object),
      tags: expect.any(Array),
    });
  });
});