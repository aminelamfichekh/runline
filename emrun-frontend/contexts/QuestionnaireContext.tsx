/**
 * Context provider for questionnaire form state
 * Allows sharing form state across all questionnaire screens
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, cleanConditionalFields, isQuestionnaireComplete } from '@/lib/validation/profileSchema';
import type { ProfileFormData } from '@/lib/validation/profileSchema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUESTIONNAIRE_DRAFT } from '@/lib/storage/keys';
import { questionnaireApi } from '@/lib/api/questionnaireApi';

const AUTOSAVE_DEBOUNCE_MS = 800;

interface QuestionnaireContextType {
  form: UseFormReturn<ProfileFormData>;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  getPreviousStepRoute: () => string | null;
  isStepValid: (step: number) => boolean;
  isComplete: boolean;
  handleFieldChange: (field: keyof ProfileFormData, value: any) => void;
  primaryGoal?: ProfileFormData['primary_goal'];
  problemToSolve?: ProfileFormData['problem_to_solve'];
  trainingLocations?: ProfileFormData['training_locations'];
}

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

interface QuestionnaireProviderProps {
  children: React.ReactNode;
  initialData?: Partial<ProfileFormData>;
  sessionUuid?: string;
}

export function QuestionnaireProvider({ children, initialData, sessionUuid }: QuestionnaireProviderProps) {
  const transformedInitialData = initialData;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      available_days: [],
      training_locations: [],
      ...transformedInitialData,
    },
  });

  // Debounced autosave to local storage (and server session if available)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValuesRef = useRef<Partial<ProfileFormData> | null>(null);

  React.useEffect(() => {
    const performAutosave = async (values: Partial<ProfileFormData>) => {
      try {
        // Save local draft
        await AsyncStorage.setItem(QUESTIONNAIRE_DRAFT, JSON.stringify(values));

        // Also try to persist to server session if we have a session UUID
        if (sessionUuid) {
          try {
            await questionnaireApi.updateSession(sessionUuid, values, false);
          } catch (e) {
            // Network/server errors are tolerated; local draft is still available
            console.log('Failed to autosave questionnaire to server session, using local draft only.');
          }
        }
      } catch (e) {
        // Ignore autosave errors; user can still complete
      }
    };

    const subscription = form.watch((values) => {
      // Store latest values
      pendingValuesRef.current = values;

      // Clear existing timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      // Schedule debounced save
      autosaveTimerRef.current = setTimeout(() => {
        if (pendingValuesRef.current) {
          performAutosave(pendingValuesRef.current);
          pendingValuesRef.current = null;
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      // Clear timer on unmount
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      // Save any pending changes immediately on unmount
      if (pendingValuesRef.current) {
        performAutosave(pendingValuesRef.current);
      }
    };
  }, [form, sessionUuid]);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9; // Updated: added step4a for available_days

  // Watch fields for conditional logic
  const primaryGoal = form.watch('primary_goal');
  const problemToSolve = form.watch('problem_to_solve');
  const trainingLocations = form.watch('training_locations');

  // Clean conditional fields when conditions change
  const handleFieldChange = useCallback(
    (field: keyof ProfileFormData, value: any) => {
      const currentValues = form.getValues();
      
      // Update the field
      form.setValue(field, value, { shouldValidate: true });

      // Clean conditional fields if needed
      if (field === 'primary_goal') {
        const cleaned = cleanConditionalFields({ [field]: value }, currentValues);
        Object.keys(cleaned).forEach((key) => {
          if (cleaned[key as keyof ProfileFormData] === undefined) {
            form.setValue(key as keyof ProfileFormData, undefined as any);
          }
        });
      }

      if (field === 'problem_to_solve' && value !== 'autre') {
        form.setValue('problem_to_solve_other', undefined);
      }

      if (field === 'training_locations' && !value.includes('autre')) {
        form.setValue('training_location_other', undefined);
      }
    },
    [form]
  );

  // Check if current step is valid
  const isStepValid = useCallback(
    (step: number): boolean => {
      const values = form.getValues();
      const errors = form.formState.errors;

      switch (step) {
        case 1: // Basic Information (step1.tsx)
          return !errors.first_name && !errors.last_name && !errors.birth_date &&
                 !errors.gender && !errors.height_cm && !errors.weight_kg &&
                 !!values.first_name && !!values.last_name && !!values.birth_date &&
                 !!values.gender && !!values.height_cm && !!values.weight_kg;

        case 2: // Primary Goal + Race Distance (step2.tsx)
          if (!values.primary_goal) return false;
          if (values.primary_goal === 'autre' && !values.primary_goal_other) return false;
          // Also check race distance if race goal selected
          if (['courir_race', 'ameliorer_chrono'].includes(values.primary_goal) && !values.race_distance) return false;
          return !errors.primary_goal && !errors.primary_goal_other && !errors.race_distance;

        case 3: // Race Goal Details - target date & intermediate objectives (step3.tsx) (conditional)
          if (!['courir_race', 'ameliorer_chrono'].includes(values.primary_goal || '')) {
            return true; // Step is optional if not race goal
          }
          return !errors.target_race_date && !!values.target_race_date;

        case 4: // Current Running Status - volume & runs per week (step4.tsx)
          return !errors.current_weekly_volume_km && !errors.current_runs_per_week &&
                 values.current_weekly_volume_km !== undefined && !!values.current_runs_per_week;

        case 5: // Available Days (step4a.tsx)
          return !errors.available_days && (values.available_days?.length || 0) > 0;

        case 6: // Running Experience (step5.tsx)
          if (!values.running_experience_period) return false;
          // Check conditional fields
          if (values.running_experience_period === '1_4_semaines' && !values.running_experience_weeks) return false;
          if (values.running_experience_period === '1_11_mois' && !values.running_experience_months) return false;
          if (values.running_experience_period === '1_10_ans' && !values.running_experience_years) return false;
          return !errors.running_experience_period && !errors.running_experience_weeks && !errors.running_experience_months && !errors.running_experience_years;

        case 7: // Problem to Solve (step6.tsx)
          if (!values.problem_to_solve) return true; // Optional
          if (values.problem_to_solve === 'autre' && !values.problem_to_solve_other) return false;
          return !errors.problem_to_solve && !errors.problem_to_solve_other;

        case 8: // Training Locations (step7.tsx)
          return !errors.training_locations && (values.training_locations?.length || 0) > 0 &&
                 (!values.training_locations?.includes('autre') || !!values.training_location_other);

        case 9: // Additional Context (step8.tsx)
          return true; // All optional fields

        default:
          return false;
      }
    },
    [form]
  );

  const nextStep = useCallback(() => {
    if (isStepValid(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, isStepValid]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Get the route for the previous step based on current step
  const getPreviousStepRoute = useCallback((): string | null => {
    if (currentStep === 1) {
      return '/'; // Go to home from step 1
    }

    switch (currentStep) {
      case 2: // step2 -> step1
        return '/(questionnaire)/step1';
      case 3: // step3 -> step2
        return '/(questionnaire)/step2';
      case 4: // step4 -> step3 (if race goal) or step2 (if not race goal)
        if (primaryGoal === 'courir_race' || primaryGoal === 'ameliorer_chrono') {
          return '/(questionnaire)/step3';
        }
        return '/(questionnaire)/step2';
      case 5: // step4a -> step4
        return '/(questionnaire)/step4';
      case 6: // step5 -> step4a
        return '/(questionnaire)/step4a';
      case 7: // step6 -> step5
        return '/(questionnaire)/step5';
      case 8: // step7 -> step6
        return '/(questionnaire)/step6';
      case 9: // step8 -> step7
        return '/(questionnaire)/step7';
      default:
        return null;
    }
  }, [currentStep, primaryGoal]);

  // Check if questionnaire is complete
  const isComplete = isQuestionnaireComplete(form.getValues());

  return (
    <QuestionnaireContext.Provider
      value={{
        form,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        goToStep,
        getPreviousStepRoute,
        isStepValid,
        isComplete,
        handleFieldChange,
        primaryGoal,
        problemToSolve,
        trainingLocations,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaireForm() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaireForm must be used within QuestionnaireProvider');
  }
  return context;
}
