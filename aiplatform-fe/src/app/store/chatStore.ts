import { create } from "zustand";
import type { Message } from "../types/api";

type State = {
  conversationId?: string;
  messages: Message[];
  isStreaming: boolean;
  isLoading: boolean;
  isCollapsed: boolean;
  addMessage: (m: Message) => void;
  updateMessageContent: (id: string, content: any) => void;
  setConversationId: (id: string) => void;
  clear: () => void;
  setMessages: (msgs: Message[], conversationId?: string) => void;
  setStreaming: (s: boolean) => void;
  setLoading: (l: boolean) => void;
  setCollapsed: (c: boolean) => void;
};

export const useChatStore = create<State>((set) => ({
  conversationId: undefined,
  messages: [],
  isStreaming: false,
  isLoading: false,
  isCollapsed: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  updateMessageContent: (id, content) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    })),
  setConversationId: (id) => set(() => ({ conversationId: id })),
  clear: () => set({ messages: [], conversationId: undefined }),
  setMessages: (msgs: Message[], conversationId?: string) =>
    set(() => ({ messages: msgs, conversationId })),
  setStreaming: (s) => set({ isStreaming: s }),
  setLoading: (l) => set({ isLoading: l }),
  setCollapsed: (c) => set({ isCollapsed: c }),
}));
