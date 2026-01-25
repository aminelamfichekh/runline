/**
 * AutosaveService
 * Gère la sauvegarde automatique avec debounce de 500ms
 * Crée la session au premier champ rempli (idéalement email)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { questionnaireApi } from '@/lib/api/questionnaireApi';
import { QUESTIONNAIRE_SESSION_UUID, QUESTIONNAIRE_DRAFT } from '@/lib/storage/keys';
import type { ProfileFormData } from '@/lib/validation/profileSchema';

const DEBOUNCE_DELAY = 500; // 500ms comme spécifié

class AutosaveService {
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingData: Partial<ProfileFormData> | null = null;
  private sessionUuid: string | null = null;
  private isInitialized = false;

  /**
   * Initialise le service et récupère la session UUID existante
   */
  async initialize(): Promise<string | null> {
    if (this.isInitialized) {
      return this.sessionUuid;
    }

    try {
      const storedUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
      if (storedUuid) {
        this.sessionUuid = storedUuid;
      }
      this.isInitialized = true;
      return this.sessionUuid;
    } catch (error) {
      console.error('Failed to initialize AutosaveService:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle session si elle n'existe pas encore
   * Appelé au premier champ rempli (idéalement email)
   */
  async ensureSession(payload?: Partial<ProfileFormData>): Promise<string | null> {
    if (this.sessionUuid) {
      return this.sessionUuid;
    }

    try {
      // Vérifier d'abord dans le storage
      const storedUuid = await AsyncStorage.getItem(QUESTIONNAIRE_SESSION_UUID);
      if (storedUuid) {
        this.sessionUuid = storedUuid;
        return this.sessionUuid;
      }

      // Créer une nouvelle session
      const session = await questionnaireApi.createSession(
        payload ? { payload } : undefined
      );
      this.sessionUuid = session.session_uuid;
      await AsyncStorage.setItem(QUESTIONNAIRE_SESSION_UUID, this.sessionUuid);
      return this.sessionUuid;
    } catch (error) {
      console.error('Failed to create questionnaire session:', error);
      // En cas d'erreur, on continue avec le draft local
      return null;
    }
  }

  /**
   * Sauvegarde avec debounce
   * Envoie uniquement les champs modifiés au backend
   */
  async save(data: Partial<ProfileFormData>, previousData?: Partial<ProfileFormData>): Promise<void> {
    // Annuler le timer précédent
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Stocker les données en attente
    this.pendingData = data;

    // Sauvegarder immédiatement en local (pas de debounce pour le draft local)
    try {
      await AsyncStorage.setItem(QUESTIONNAIRE_DRAFT, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save draft locally:', error);
    }

    // Débouncer la sauvegarde serveur
    this.debounceTimer = setTimeout(async () => {
      if (!this.pendingData) return;

      try {
        // S'assurer qu'on a une session
        await this.ensureSession(this.pendingData);

        if (this.sessionUuid) {
          // Calculer uniquement les champs modifiés
          const changedFields = this.getChangedFields(this.pendingData, previousData);
          
          if (Object.keys(changedFields).length > 0) {
            await questionnaireApi.updateSession(this.sessionUuid, changedFields, false);
          }
        }
      } catch (error) {
        // Les erreurs réseau sont tolérées, le draft local reste disponible
        console.log('Failed to autosave to server, using local draft only:', error);
      } finally {
        this.pendingData = null;
      }
    }, DEBOUNCE_DELAY);
  }

  /**
   * Calcule les champs modifiés entre deux états
   */
  private getChangedFields(
    current: Partial<ProfileFormData>,
    previous?: Partial<ProfileFormData>
  ): Partial<ProfileFormData> {
    if (!previous) {
      return current;
    }

    const changed: Partial<ProfileFormData> = {};

    // Comparer tous les champs
    for (const key in current) {
      const currentValue = current[key as keyof ProfileFormData];
      const previousValue = previous[key as keyof ProfileFormData];

      // Comparaison profonde pour les arrays
      if (Array.isArray(currentValue) && Array.isArray(previousValue)) {
        if (JSON.stringify(currentValue.sort()) !== JSON.stringify(previousValue.sort())) {
          changed[key as keyof ProfileFormData] = currentValue as any;
        }
      } else if (currentValue !== previousValue) {
        changed[key as keyof ProfileFormData] = currentValue as any;
      }
    }

    return changed;
  }

  /**
   * Force une sauvegarde immédiate (sans debounce)
   */
  async forceSave(data: Partial<ProfileFormData>): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    try {
      await AsyncStorage.setItem(QUESTIONNAIRE_DRAFT, JSON.stringify(data));
      
      await this.ensureSession(data);
      
      if (this.sessionUuid) {
        await questionnaireApi.updateSession(this.sessionUuid, data, false);
      }
    } catch (error) {
      console.error('Failed to force save:', error);
    }
  }

  /**
   * Récupère la session UUID actuelle
   */
  getSessionUuid(): string | null {
    return this.sessionUuid;
  }

  /**
   * Nettoie le service (annule les timers en attente)
   */
  cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Instance singleton
export const autosaveService = new AutosaveService();



