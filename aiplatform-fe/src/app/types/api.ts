export type Role = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  role: Role;
  content: any;
  createdAt?: string;
};

export type ChatResponse = {
  conversationId: string;
  reply?: any; 
};

export type OnChunk = (chunk: string) => void;
