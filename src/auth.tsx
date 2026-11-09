import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

// Demo credentials — hardcoded by design.
export const DEMO_USERNAME = 'admin';
export const DEMO_PASSWORD = 'password123';

const SESSION_KEY = 'session.user';

type AuthContextValue = {
  user: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = (username: string, password: string) => {
    const name = username.trim();
    if (name !== DEMO_USERNAME || password !== DEMO_PASSWORD) return false;
    setUser(name);
    void AsyncStorage.setItem(SESSION_KEY, name);
    return true;
  };

  const signOut = () => {
    setUser(null);
    void AsyncStorage.removeItem(SESSION_KEY);
  };

  return <AuthContext value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
