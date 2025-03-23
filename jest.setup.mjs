// Konfiguracja dla obsługi modułów ESM w testach
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'crypto';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.crypto = webcrypto; 