export interface ServerInfo {
  name: string;
  version: string;
  capabilities: {
    tools: string[];
    resources: string[];
  };
} 