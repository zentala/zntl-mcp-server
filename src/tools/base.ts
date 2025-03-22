/**
 * Base interface for MCP tools
 */
import { z } from 'zod';

export interface ToolDef<T extends z.ZodType, R> {
  // Schema for validating the input
  schema: T;
  
  // Function to execute the tool
  execute(input: z.infer<T>): Promise<R>;
  
  // JSON Schema metadata for the tool
  metadata: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}