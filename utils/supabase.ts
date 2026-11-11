import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export type TodoRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type TodoInsert = {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  created_at?: string;
  updated_at?: string;
};

type Database = {
  public: {
    Tables: {
      todos: {
        Row: TodoRow;
        Insert: TodoInsert;
        Update: Partial<TodoInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env.local.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
