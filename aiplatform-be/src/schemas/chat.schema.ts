import { z } from 'zod';

export const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  prompt: z.string().min(1).max(5000),
  stream: z.boolean().optional().default(false),
});

export type ChatRequest = z.infer<typeof chatSchema>;
