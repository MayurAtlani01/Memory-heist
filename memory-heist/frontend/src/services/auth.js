import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Sign up a new operative with email, password, and codename/username
 */
export async function signUp({ email, password, username }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please provide your Supabase URL and Anon Key.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0]
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing operative
 */
export async function signIn({ email, password }) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured yet. Please provide your Supabase URL and Anon Key.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current operative
 */
export async function signOut() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session and user
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes (login, logout, token refresh)
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}
