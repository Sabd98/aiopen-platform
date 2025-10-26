import api from '../utils/api';
import type { Conversation } from '../store/conversationStore';

export interface CreateConversationRequest {
  title: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

// Fetch all conversations for the current user
export async function fetchConversations(): Promise<ConversationResponse> {
  const response = await api.get('/conversations');
  return response.data;
}

// Create a new conversation
export async function createConversation(data: CreateConversationRequest): Promise<Conversation> {
  const response = await api.post('/conversations', data);
  return response.data.conversation;
}

// Delete a conversation
export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/conversations/${id}`);
}

// Get specific conversation with messages
export async function getConversation(id: string): Promise<Conversation> {
  const response = await api.get(`/conversations/${id}`);
  return response.data.conversation;
}

// Update conversation title
export async function updateConversationTitle(id: string, title: string): Promise<Conversation> {
  const response = await api.patch(`/conversations/${id}`, { title });
  return response.data.conversation;
}