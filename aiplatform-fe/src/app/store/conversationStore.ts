import { create } from 'zustand';

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: any;
    createdAt: string;
  }>;
}

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setSelectedConversation: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,
  selectedConversationId: null,

  setConversations: (conversations) => set({ conversations }),
  
  addConversation: (conversation) => 
    set((state) => ({ 
      conversations: [conversation, ...state.conversations] 
    })),
  
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),
  
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== id),
      selectedConversationId: 
        state.selectedConversationId === id ? null : state.selectedConversationId,
    })),
  
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clear: () => set({
    conversations: [],
    loading: false,
    error: null,
    selectedConversationId: null,
  }),
}));