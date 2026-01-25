/**
 * Questionnaire session attachment utilities
 * Handles attaching anonymous questionnaire sessions to user accounts after login
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api/client';
import { QUESTIONNAIRE_SESSION_UUID, QUESTIONNAIRE_PENDING_ATTACH } from '@/lib/storage/keys';

/**
 * Attach a questionnaire session if one is pending
 * Called after successful login to transfer anonymous questionnaire data
 * @returns true if a session was attached, false otherwise
 */
export async function attachQuestionnaireIfNeeded(): Promise<boolean> {
  try {
    // Check if there's a pending session to attach
    const sessionUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
    const isPending = await AsyncStorage.getItem(QUESTIONNAIRE_PENDING_ATTACH);

    if (!sessionUuid || isPending !== 'true') {
      return false;
    }

    // Try to attach the session
    await apiClient.post(`/questionnaire/sessions/${sessionUuid}/attach`);

    // Clear pending flag on success
    await AsyncStorage.removeItem(QUESTIONNAIRE_PENDING_ATTACH);

    console.log('Successfully attached questionnaire session:', sessionUuid);
    return true;
  } catch (error) {
    console.error('Failed to attach questionnaire session:', error);
    // Don't throw - attachment failure shouldn't block login
    return false;
  }
}
