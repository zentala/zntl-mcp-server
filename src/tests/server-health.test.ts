import fetch from 'node-fetch';
import { ServerInfo } from '../types/server.js';

describe('MCP Server Health Check', () => {
  const SERVER_URL = 'http://localhost:3501';

  test('serwer powinien być dostępny', async () => {
    console.log('🔄 Sprawdzanie dostępności serwera...');
    console.log(`🌐 URL: ${SERVER_URL}`);
    
    try {
      const response = await fetch(`${SERVER_URL}/`);
      expect(response.status).toBe(200);
      
      const data = await response.json() as ServerInfo;
      console.log('✅ Serwer jest dostępny:', data);
      
      // Sprawdź, czy test-api jest w dostępnych narzędziach
      expect(data.capabilities.tools).toContain('test-api');
      console.log('✅ Narzędzie test-api jest dostępne');
      
      // Sprawdź, czy calibrator jest w dostępnych narzędziach
      expect(data.capabilities.tools).toContain('calibrator');
      console.log('✅ Narzędzie calibrator jest dostępne');
      
    } catch (error) {
      console.error('❌ Błąd podczas sprawdzania serwera:', error);
      throw error;
    }
  });

  test('SSE endpoint powinien być dostępny', async () => {
    console.log('🔄 Sprawdzanie endpointu SSE...');
    console.log(`🌐 URL: ${SERVER_URL}/sse`);
    
    try {
      const response = await fetch(`${SERVER_URL}/sse`);
      expect(response.status).toBe(200);
      console.log('✅ Endpoint SSE jest dostępny');
      
      // Sprawdź nagłówki SSE
      expect(response.headers.get('content-type')).toBe('text/event-stream');
      console.log('✅ Nagłówki SSE są poprawne');
      
    } catch (error) {
      console.error('❌ Błąd podczas sprawdzania SSE:', error);
      throw error;
    }
  });

  test('message endpoint powinien być dostępny', async () => {
    console.log('🔄 Sprawdzanie endpointu message...');
    console.log(`🌐 URL: ${SERVER_URL}/message`);
    
    try {
      const response = await fetch(`${SERVER_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'test'
        })
      });
      
      // Endpoint powinien zwrócić 400, ponieważ nie ma aktywnego połączenia SSE
      expect(response.status).toBe(400);
      console.log('✅ Endpoint message jest dostępny i zwraca oczekiwany błąd');
      
    } catch (error) {
      console.error('❌ Błąd podczas sprawdzania endpointu message:', error);
      throw error;
    }
  });
}); 