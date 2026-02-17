/**
 * Plan types for the training plan system
 * Matches the JSON schema from PlanGeneratorService on the backend
 */

export type PlanType = 'initial' | 'monthly';
export type PlanStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type SessionType = 'repos' | 'footing' | 'qualitative' | 'course';
export type DayName = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';

/**
 * Content of a single workout session
 */
export interface SessionContent {
  description: string;
  duration?: string;
  session_type?: string;
  echauffement?: string;
  corps_de_seance?: string;
  recuperation?: string;
  race_distance?: string;
}

/**
 * A single day in the training plan
 */
export interface PlanDay {
  day_name: DayName;
  date: string; // Format: DD/MM
  type: SessionType;
  content: SessionContent;
}

/**
 * A week in the training plan
 */
export interface PlanWeek {
  week_number: number;
  start_date: string; // Format: DD/MM
  end_date: string; // Format: DD/MM
  days: PlanDay[];
}

/**
 * The content structure of a generated plan
 */
export interface PlanContent {
  weeks: PlanWeek[];
}

/**
 * Full plan object as returned by the API
 */
export interface Plan {
  id: number;
  user_id: number;
  type: PlanType;
  status: PlanStatus;
  content: PlanContent | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

/**
 * API response types
 */
export interface PlansResponse {
  plans: Plan[];
}

export interface PlanResponse {
  plan: Plan | null;
}

/**
 * Helper function to check if a plan is ready to display
 */
export function isPlanReady(plan: Plan | null): plan is Plan & { content: PlanContent; status: 'completed' } {
  return plan !== null && plan.status === 'completed' && plan.content !== null;
}

/**
 * Helper function to get current week from a plan
 */
export function getCurrentWeek(plan: Plan): PlanWeek | null {
  if (!isPlanReady(plan)) return null;

  const today = new Date();
  const currentDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

  for (const week of plan.content.weeks) {
    // Parse start and end dates (DD/MM format)
    const [startDay, startMonth] = week.start_date.split('/').map(Number);
    const [endDay, endMonth] = week.end_date.split('/').map(Number);

    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, startMonth - 1, startDay);
    const endDate = new Date(currentYear, endMonth - 1, endDay);

    if (today >= startDate && today <= endDate) {
      return week;
    }
  }

  return null;
}

/**
 * Helper function to get today's workout from a plan
 */
export function getTodayWorkout(plan: Plan): PlanDay | null {
  const currentWeek = getCurrentWeek(plan);
  if (!currentWeek) return null;

  const today = new Date();
  const currentDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

  return currentWeek.days.find(day => day.date === currentDateStr) || null;
}

/**
 * Get French day names mapping
 */
export const DAY_NAMES_FR: Record<string, DayName> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

/**
 * Session type labels in French
 */
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  repos: 'Repos',
  footing: 'Footing',
  qualitative: 'Qualitatif',
  course: 'Course',
};

/**
 * Session type colors for UI
 */
export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  repos: '#9CA3AF', // gray
  footing: '#10B981', // green
  qualitative: '#F59E0B', // amber
  course: '#EF4444', // red
};
