// Helper-Funktionen für Supabase Edge Functions

import { supabase } from './supabase';

/**
 * Ruft die delete-user Edge Function auf, um den kompletten Account zu löschen
 * Löscht sowohl das user_profiles als auch den auth.users Eintrag
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    // Session Token holen
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    // Edge Function aufrufen
    const { data, error } = await supabase.functions.invoke('delete-user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete account');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account'
    };
  }
}
