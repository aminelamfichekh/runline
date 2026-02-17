export type Gender = 'male' | 'female' | 'other';
export type PrimaryGoal = 'me_lancer' | 'reprendre' | 'entretenir' | 'ameliorer_condition' | 'courir_race' | 'ameliorer_chrono' | 'autre';
export type RaceDistance = '5km' | '10km' | '15km' | '20km' | '25km' | 'semi_marathon' | 'marathon' | 'autre';
export type CurrentRunsPerWeek = '0' | '1_2' | '3_4' | '5_6' | '7_plus';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type RunningExperiencePeriod = 'je_commence' | 'je_reprends' | '1_4_semaines' | '1_11_mois' | '1_10_ans' | 'plus_10_ans';
export type ProblemToSolve = 'structure' | 'blessure' | 'motivation' | 'autre';
export type TrainingLocation = 'route' | 'chemins' | 'piste' | 'tapis' | 'autre';

export interface CurrentRaceTime {
  distance: string;
  time: string;
}

// ProfileFormData and UserProfileFormData are exported from lib/validation/profileSchema.ts
import type { UserProfileFormData } from '@/lib/validation/profileSchema';
export type { ProfileFormData, UserProfileFormData } from '@/lib/validation/profileSchema';

export interface UserProfileResponse {
  profile: UserProfileFormData | null;
  questionnaire_completed: boolean;
}
