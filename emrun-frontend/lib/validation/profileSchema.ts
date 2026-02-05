import { z } from 'zod';

// Helper to check if value is multiple of 5
const isMultipleOf5 = (value: number) => value % 5 === 0;

// Base schema for all fields
export const profileSchema = z.object({
  // Email (requis, sauvegarde immédiate)
  email: z.string().email('Adresse email invalide').min(1, 'L\'email est requis'),

  // Basic Information
  first_name: z.string().min(1, 'Le prénom est requis').max(255),
  last_name: z.string().min(1, 'Le nom est requis').max(255),
  birth_date: z.string().refine(
    (date) => {
      const d = new Date(date);
      return d < new Date(); // Must be in the past
    },
    { message: 'La date de naissance doit être dans le passé' }
  ),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Le sexe est requis',
  }),
  height_cm: z.number().min(0.5, 'La taille doit être d\'au moins 0.5m').max(2.5, 'La taille doit être d\'au plus 2.5m'),
  weight_kg: z.number().int().min(20, 'Le poids doit être d\'au moins 20kg').max(300, 'Le poids doit être d\'au plus 300kg'),

  // Primary Goal
  primary_goal: z.enum([
    'me_lancer',
    'reprendre',
    'entretenir',
    'ameliorer_condition',
    'courir_race',
    'ameliorer_chrono',
    'autre',
  ], {
    required_error: 'L\'objectif principal est requis',
  }),
  primary_goal_other: z.string().max(500).optional(),

  // Race Goal Details (conditional)
  race_distance: z.enum(['5km', '10km', '15km', '20km', '25km', 'semi_marathon', 'marathon', 'autre']).optional(),
  race_distance_km: z.number().int().min(1).max(50).optional(), // when race_distance === 'autre' (legacy)
  race_distance_other: z.string().max(500).optional(), // text description when race_distance === 'autre'
  target_race_date: z.string().optional(),
  intermediate_objectives: z.string().max(1000).optional(),
  current_race_times: z.array(
    z.object({
      distance: z.string(),
      time: z.string(),
    })
  ).optional(),

  // Additional race-related context from questionnaire (optional free text)
  pause_duration: z.string().max(255).optional(),
  objectives: z.string().max(1000).optional(),
  records: z.string().max(1000).optional(),

  // Current Running Status
  current_weekly_volume_km: z.number().int().min(0).max(100).refine(
    isMultipleOf5,
    { message: 'Le volume hebdomadaire doit être un multiple de 5 km (0-100km)' }
  ),
  current_runs_per_week: z.enum(['0', '1_2', '3_4', '5_6', '7_plus'], {
    required_error: 'Le nombre de sorties par semaine est requis',
  }),
  available_days: z.array(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  ).min(1, 'Au moins un jour disponible est requis'),

  // Running Experience
  running_experience_period: z.enum([
    'je_commence',
    'je_reprends',
    '1_4_semaines',
    '1_11_mois',
    '1_10_ans',
    'plus_10_ans',
  ], {
    required_error: 'La période d\'expérience de course est requise',
  }),
  running_experience_weeks: z.string().optional(),
  running_experience_months: z.string().optional(),
  running_experience_years: z.string().optional(),

  // Problem to Solve
  problem_to_solve: z.enum(['structure', 'blessure', 'motivation', 'autre']).optional(),
  problem_to_solve_other: z.string().max(500).optional(),

  // Training Locations
  training_locations: z.array(
    z.enum(['route', 'chemins', 'piste', 'tapis', 'autre'])
  ).min(1, 'Au moins un lieu d\'entraînement est requis'),
  training_location_other: z.string().max(255).optional(),

  // Additional Context
  injuries: z.array(z.string()).optional(),
  equipment: z.string().max(1000).optional(),
  personal_constraints: z.string().max(1000).optional(),
}).superRefine((data, ctx) => {
  // Conditional validation: primary_goal_other required if primary_goal is "autre"
  if (data.primary_goal === 'autre') {
    if (!data.primary_goal_other || data.primary_goal_other.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser votre objectif principal',
        path: ['primary_goal_other'],
      });
    }
  }

  // Conditional validation: race fields required if primary_goal is race-related
  const isRaceGoal = data.primary_goal === 'courir_race' || data.primary_goal === 'ameliorer_chrono';

  if (isRaceGoal) {
    if (!data.race_distance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La distance de course est requise quand l\'objectif principal est une course',
        path: ['race_distance'],
      });
    }
    if (data.race_distance === 'autre' && (!data.race_distance_other || data.race_distance_other.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez décrire votre objectif de course',
        path: ['race_distance_other'],
      });
    }

    if (!data.target_race_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de course cible est requise quand l\'objectif principal est une course',
        path: ['target_race_date'],
      });
    } else {
      // Validate target_race_date is in the future
      const targetDate = new Date(data.target_race_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate <= today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La date de course cible doit être dans le futur',
          path: ['target_race_date'],
        });
      }
    }
  }

  // Conditional validation: problem_to_solve_other required if problem_to_solve is "autre"
  if (data.problem_to_solve === 'autre') {
    if (!data.problem_to_solve_other || data.problem_to_solve_other.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le problème à résoudre',
        path: ['problem_to_solve_other'],
      });
    }
  }

  // Conditional validation: training_location_other required if "autre" is in training_locations
  if (data.training_locations.includes('autre')) {
    if (!data.training_location_other || data.training_location_other.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le lieu d\'entraînement quand "autre" est sélectionné',
        path: ['training_location_other'],
      });
    }
  }

  // Conditional validation: running_experience_weeks required if period is "1_4_semaines"
  if (data.running_experience_period === '1_4_semaines') {
    if (!data.running_experience_weeks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le nombre de semaines',
        path: ['running_experience_weeks'],
      });
    }
  }

  // Conditional validation: running_experience_months required if period is "1_11_mois"
  if (data.running_experience_period === '1_11_mois') {
    if (!data.running_experience_months) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le nombre de mois',
        path: ['running_experience_months'],
      });
    }
  }

  // Conditional validation: running_experience_years required if period is "1_10_ans"
  if (data.running_experience_period === '1_10_ans') {
    if (!data.running_experience_years) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Veuillez préciser le nombre d\'années',
        path: ['running_experience_years'],
      });
    }
  }
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type UserProfileFormData = ProfileFormData;

/**
 * Helper function to check if questionnaire is complete
 * Matches backend ProfileService completion logic
 */
export function isQuestionnaireComplete(data: Partial<ProfileFormData>): boolean {
  const requiredFields: (keyof ProfileFormData)[] = [
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'height_cm',
    'weight_kg',
    'primary_goal',
    'current_weekly_volume_km',
    'current_runs_per_week',
    'available_days',
    'running_experience_period',
    'training_locations',
  ];

  // Check all required fields
  for (const field of requiredFields) {
    const value = data[field];
    
    if (field === 'available_days' || field === 'training_locations') {
      if (!Array.isArray(value) || value.length === 0) {
        return false;
      }
    } else if (value === undefined || value === null || value === '') {
      return false;
    }
  }

  // If primary goal is race-related, also require race fields
  if (data.primary_goal === 'courir_race' || data.primary_goal === 'ameliorer_chrono') {
    if (!data.race_distance || !data.target_race_date) {
      return false;
    }
    if (data.race_distance === 'autre' && (!data.race_distance_other || data.race_distance_other.trim() === '')) {
      return false;
    }
  }

  return true;
}

/**
 * Helper to clean conditional fields when conditions change
 * Matches backend ProfileService cleanup logic
 */
export function cleanConditionalFields(
  data: Partial<ProfileFormData>,
  previousData?: Partial<ProfileFormData>
): Partial<ProfileFormData> {
  const cleaned = { ...data };

  // Clear race fields if primary goal is not race-related
  if (cleaned.primary_goal && !['courir_race', 'ameliorer_chrono'].includes(cleaned.primary_goal)) {
    cleaned.race_distance = undefined;
    cleaned.race_distance_km = undefined;
    cleaned.race_distance_other = undefined;
    cleaned.target_race_date = undefined;
    cleaned.intermediate_objectives = undefined;
    cleaned.current_race_times = undefined;
  }
  // Clear race_distance_km and race_distance_other when race_distance is not "autre"
  if (cleaned.race_distance && cleaned.race_distance !== 'autre') {
    cleaned.race_distance_km = undefined;
    cleaned.race_distance_other = undefined;
  }

  // Clear primary_goal_other if primary_goal is not "autre"
  if (cleaned.primary_goal && cleaned.primary_goal !== 'autre') {
    cleaned.primary_goal_other = undefined;
  }

  // Clear problem_to_solve_other if problem_to_solve is not "autre"
  if (cleaned.problem_to_solve && cleaned.problem_to_solve !== 'autre') {
    cleaned.problem_to_solve_other = undefined;
  }

  // Clear training_location_other if "autre" is not in training_locations
  if (cleaned.training_locations && !cleaned.training_locations.includes('autre')) {
    cleaned.training_location_other = undefined;
  }

  return cleaned;
}
