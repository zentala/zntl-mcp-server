import { calibratorTool } from '../tools/calibrator.js';
import { jest } from '@jest/globals';
import winston from 'winston';

// Get the mocked logger instance
const mockLogger = winston.createLogger();

describe('Calibrator Tool', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('powinien obsłużyć akcję kliknięcia kalibratora', async () => {
    const result = await calibratorTool.execute({
      action: 'click',
      parameters: { test: true }
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Calibrator clicked successfully');
    expect(result.timestamp).toBeDefined();
    
    // Sprawdź czy logi zostały wywołane
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator tool execution started', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Processing calibrator action: click', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator click action detected', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Simulating calibrator click...');
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator click simulation completed');
  });

  test('powinien obsłużyć akcję testu kalibratora', async () => {
    const result = await calibratorTool.execute({
      action: 'test',
      parameters: { test: true }
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Calibrator test completed successfully');
    expect(result.timestamp).toBeDefined();
    
    // Sprawdź czy logi zostały wywołane
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator tool execution started', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Processing calibrator action: test', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator test action detected', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Running calibrator test...');
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator test completed');
  });

  test('powinien obsłużyć nieznaną akcję kalibratora', async () => {
    const result = await calibratorTool.execute({
      action: 'unknown' as any,
      parameters: { test: true }
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Unknown calibrator action: unknown');
    expect(result.timestamp).toBeDefined();
    
    // Sprawdź czy logi zostały wywołane
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator tool execution started', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Processing calibrator action: unknown', expect.any(Object));
    expect(mockLogger.error).toHaveBeenCalledWith('Calibrator error occurred:', expect.any(Error));
  });

  test('powinien obsłużyć błąd podczas wykonywania', async () => {
    // Symuluj błąd podczas wykonywania
    jest.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const result = await calibratorTool.execute({
      action: 'click',
      parameters: { test: true }
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Test error');
    expect(result.timestamp).toBeDefined();
    
    // Sprawdź czy logi zostały wywołane
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator tool execution started', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Processing calibrator action: click', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Calibrator click action detected', expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith('Simulating calibrator click...');
    expect(mockLogger.error).toHaveBeenCalledWith('Calibrator error occurred:', expect.any(Error));
  });
}); 