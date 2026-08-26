import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('jwt_token'),
  user: null, // Depending on whether user info is stored in local storage
  setAuth: (token, user) => {
    localStorage.setItem('jwt_token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('jwt_token');
    set({ token: null, user: null });
  }
}));
