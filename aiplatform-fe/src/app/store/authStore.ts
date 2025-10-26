import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await authApi.login(credentials);
            
            if (response.success && response.user) {
              set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              throw new Error(response.message || 'Login failed');
            }
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Login failed',
            });
            throw error;
          }
        },

        register: async (credentials: RegisterCredentials) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await authApi.register(credentials);
            
            if (response.success && response.user) {
              set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              throw new Error(response.message || 'Registration failed');
            }
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Registration failed',
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true });
            
            await authApi.logout();
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            
            // Clear other stores on logout
            try {
              const { useConversationStore } = await import('./conversationStore');
              const { useChatStore } = await import('./chatStore');
              useConversationStore.getState().clear();
              useChatStore.getState().clear();
            } catch (error) {
              console.warn('Failed to clear stores on logout:', error);
            }
          } catch {
            // Even if logout fails on server, clear local state
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            
            // Clear other stores even on error
            try {
              const { useConversationStore } = await import('./conversationStore');
              const { useChatStore } = await import('./chatStore');
              useConversationStore.getState().clear();
              useChatStore.getState().clear();
            } catch (error) {
              console.warn('Failed to clear stores on logout:', error);
            }
          }
        },

        checkAuth: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const { isAuthenticated, user } = await authApi.checkAuth();
            
            set({
              user,
              isAuthenticated,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Auth check failed',
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);