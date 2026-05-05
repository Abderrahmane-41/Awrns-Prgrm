import { supabase } from '../lib/supabaseClient';

const NOT_CONFIGURED = {
  success: false,
  message: 'Supabase is not configured yet. Please add your credentials to the .env file.',
};

const authService = {
  /**
   * Sign up a new user with email, password, and full name.
   */
  async signup(email, password, fullName) {
    if (!supabase) return NOT_CONFIGURED;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // If email confirmation is required, data.user will exist but session will be null
      if (data.user && !data.session) {
        return {
          success: true,
          confirmationRequired: true,
          message: 'Please check your email to confirm your account.',
        };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred.' };
    }
  },

  /**
   * Log in an existing user with email and password.
   */
  async login(email, password) {
    if (!supabase) return NOT_CONFIGURED;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Please confirm your email before logging in.',
          };
        }
        return { success: false, message: error.message };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email,
        },
        session: data.session,
      };
    } catch (err) {
      return { success: false, message: 'An unexpected error occurred.' };
    }
  },

  /**
   * Log out the current user.
   */
  async logout() {
    if (!supabase) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, message: error.message };
    return { success: true };
  },

  /**
   * Get the currently authenticated user.
   */
  async getCurrentUser() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session.user;
  },

  /**
   * Subscribe to authentication state changes.
   * @param {Function} callback - Called with (event, session)
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription.unsubscribe;
  },
};

export default authService;
