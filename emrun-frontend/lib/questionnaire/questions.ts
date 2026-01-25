/**
 * Questionnaire Questions Definition
 * Mapping des 21 questions selon les spécifications
 */

import type { ProfileFormData } from '@/lib/validation/profileSchema';

export interface Question {
  id: number;
  key: keyof ProfileFormData | string;
  title: string;
  subtitle?: string;
  type: 'email' | 'text' | 'wheel' | 'radio' | 'checkbox' | 'date' | 'multi-text';
  required: boolean;
  conditional?: {
    field: keyof ProfileFormData;
    values: any[];
  };
  options?: { value: any; label: string }[];
  wheelConfig?: {
    min: number;
    max: number;
    step: number;
    unit?: string;
  };
  skipIf?: (data: Partial<ProfileFormData>) => boolean;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    key: 'email',
    title: 'Quel est votre email ?',
    subtitle: 'Nous l\'utiliserons pour sauvegarder votre progression',
    type: 'email',
    required: true,
  },
  {
    id: 2,
    key: 'first_name',
    title: 'Quel est votre nom ?',
    type: 'text',
    required: true,
  },
  {
    id: 3,
    key: 'last_name',
    title: 'Quel est votre prénom ?',
    type: 'text',
    required: true,
  },
  {
    id: 4,
    key: 'birth_date',
    title: 'Quelle est votre date de naissance ?',
    type: 'date',
    required: true,
  },
  {
    id: 5,
    key: 'gender',
    title: 'Quel est votre sexe ?',
    type: 'radio',
    required: true,
    options: [
      { value: 'male', label: 'Homme' },
      { value: 'female', label: 'Femme' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 6,
    key: 'height_cm',
    title: 'Quelle est votre taille ?',
    subtitle: 'en centimètres',
    type: 'wheel',
    required: true,
    wheelConfig: {
      min: 100,
      max: 250,
      step: 1,
      unit: 'cm',
    },
  },
  {
    id: 7,
    key: 'weight_kg',
    title: 'Quel est votre poids ?',
    subtitle: 'en kilogrammes',
    type: 'wheel',
    required: true,
    wheelConfig: {
      min: 20,
      max: 300,
      step: 1,
      unit: 'kg',
    },
  },
  {
    id: 8,
    key: 'primary_goal',
    title: 'Quel est votre objectif principal ?',
    type: 'radio',
    required: true,
    options: [
      { value: 'me_lancer', label: 'Me lancer dans la course à pied' },
      { value: 'reprendre', label: 'Reprendre la course à pied' },
      { value: 'entretenir', label: 'Entretenir ma forme' },
      { value: 'ameliorer_condition', label: 'Améliorer ma condition physique générale' },
      { value: 'courir_race', label: 'Courir un 5 km / 10 km / semi-marathon / marathon' },
      { value: 'ameliorer_chrono', label: 'Améliorer mon chrono sur 5 km / 10 km / semi-marathon / marathon' },
      { value: 'autre', label: 'Autres' },
    ],
  },
  {
    id: 9,
    key: 'primary_goal_other',
    title: 'Précisez votre objectif principal',
    type: 'text',
    required: true,
    conditional: {
      field: 'primary_goal',
      values: ['autre'],
    },
  },
  {
    id: 10,
    key: 'race_distance',
    title: 'Quelle distance souhaitez-vous courir ?',
    type: 'radio',
    required: true,
    conditional: {
      field: 'primary_goal',
      values: ['courir_race', 'ameliorer_chrono'],
    },
    options: [
      { value: '5km', label: '5 km' },
      { value: '10km', label: '10 km' },
      { value: 'semi_marathon', label: 'Semi-marathon' },
      { value: 'marathon', label: 'Marathon' },
    ],
  },
  {
    id: 12,
    key: 'target_race_date',
    title: 'Quand est prévue cette course ?',
    type: 'date',
    required: true,
    conditional: {
      field: 'primary_goal',
      values: ['courir_race', 'ameliorer_chrono'],
    },
  },
  {
    id: 13,
    key: 'intermediate_objectives',
    title: 'Objectifs intermédiaires (optionnel)',
    subtitle: 'Décrivez vos objectifs intermédiaires',
    type: 'text',
    required: false,
    conditional: {
      field: 'primary_goal',
      values: ['courir_race', 'ameliorer_chrono'],
    },
  },
  {
    id: 14,
    key: 'current_race_times',
    title: 'Records personnels (optionnel)',
    subtitle: 'Ajoutez vos meilleurs temps',
    type: 'multi-text',
    required: false,
    conditional: {
      field: 'primary_goal',
      values: ['courir_race', 'ameliorer_chrono'],
    },
  },
  {
    id: 15,
    key: 'current_weekly_volume_km',
    title: 'Quel est votre volume hebdomadaire actuel ?',
    subtitle: 'en kilomètres par semaine',
    type: 'wheel',
    required: true,
    wheelConfig: {
      min: 0,
      max: 100,
      step: 5,
      unit: 'km/semaine',
    },
  },
  {
    id: 16,
    key: 'current_runs_per_week',
    title: 'Combien de sorties faites-vous par semaine ?',
    type: 'radio',
    required: true,
    options: [
      { value: '0', label: 'Pas du tout (0)' },
      { value: '1_2', label: 'Un peu (1-2)' },
      { value: '3_4', label: 'Beaucoup (3-4)' },
      { value: '5_6', label: 'Passionnément (5-6)' },
      { value: '7_plus', label: 'À la folie (7 ou +)' },
    ],
  },
  {
    id: 17,
    key: 'available_days',
    title: 'Quels jours êtes-vous disponible pour courir ?',
    type: 'checkbox',
    required: true,
    options: [
      { value: 'monday', label: 'Lundi' },
      { value: 'tuesday', label: 'Mardi' },
      { value: 'wednesday', label: 'Mercredi' },
      { value: 'thursday', label: 'Jeudi' },
      { value: 'friday', label: 'Vendredi' },
      { value: 'saturday', label: 'Samedi' },
      { value: 'sunday', label: 'Dimanche' },
    ],
  },
  {
    id: 18,
    key: 'running_experience_period',
    title: 'Depuis combien de temps courez-vous régulièrement ?',
    type: 'radio',
    required: true,
    options: [
      { value: 'je_commence', label: 'Je commence' },
      { value: '1_11_mois', label: '1 mois à 11 mois' },
      { value: '1_10_ans', label: '1 an à 10 ans' },
      { value: 'plus_10_ans', label: 'Plus de 10 ans' },
    ],
  },
  {
    id: 19,
    key: 'problem_to_solve',
    title: 'Quel problème souhaitez-vous résoudre ? (optionnel)',
    type: 'radio',
    required: false,
    options: [
      { value: 'structure', label: 'Besoin de structure' },
      { value: 'blessure', label: 'Retour de blessure' },
      { value: 'motivation', label: 'Motivation' },
      { value: 'autre', label: 'Autre' },
    ],
  },
  {
    id: 20,
    key: 'problem_to_solve_other',
    title: 'Précisez le problème',
    type: 'text',
    required: true,
    conditional: {
      field: 'problem_to_solve',
      values: ['autre'],
    },
  },
  {
    id: 21,
    key: 'injuries',
    title: 'Blessures / limitations (optionnel)',
    subtitle: 'Décrivez vos blessures ou limitations',
    type: 'text',
    required: false,
  },
  {
    id: 22,
    key: 'training_locations',
    title: 'Où préférez-vous vous entraîner ?',
    type: 'checkbox',
    required: true,
    options: [
      { value: 'route', label: 'Route' },
      { value: 'chemins', label: 'Chemins' },
      { value: 'piste', label: 'Piste' },
      { value: 'tapis', label: 'Tapis' },
      { value: 'autre', label: 'Autre' },
    ],
  },
  {
    id: 23,
    key: 'training_location_other',
    title: 'Précisez le lieu d\'entraînement',
    type: 'text',
    required: true,
    conditional: {
      field: 'training_locations',
      values: ['autre'],
    },
  },
  {
    id: 24,
    key: 'equipment',
    title: 'Équipement (optionnel)',
    subtitle: 'Décrivez votre équipement',
    type: 'text',
    required: false,
  },
  {
    id: 25,
    key: 'personal_constraints',
    title: 'Contraintes personnelles / professionnelles (optionnel)',
    subtitle: 'Décrivez vos contraintes',
    type: 'text',
    required: false,
  },
];

/**
 * Get the list of visible questions based on current form data
 */
export function getVisibleQuestions(data: Partial<ProfileFormData>): Question[] {
  return QUESTIONS.filter((question) => {
    // Skip if conditional and condition not met
    if (question.conditional) {
      const fieldValue = data[question.conditional.field];
      if (!question.conditional.values.includes(fieldValue)) {
        return false;
      }
    }

    // Skip if skipIf condition is true
    if (question.skipIf && question.skipIf(data)) {
      return false;
    }

    return true;
  });
}

/**
 * Get question by ID
 */
export function getQuestionById(id: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

/**
 * Get question by key
 */
export function getQuestionByKey(key: string): Question | undefined {
  return QUESTIONS.find((q) => q.key === key);
}

/**
 * Get next question ID
 */
export function getNextQuestionId(currentId: number, data: Partial<ProfileFormData>): number | null {
  const visibleQuestions = getVisibleQuestions(data);
  const currentIndex = visibleQuestions.findIndex((q) => q.id === currentId);
  
  if (currentIndex === -1 || currentIndex === visibleQuestions.length - 1) {
    return null;
  }
  
  return visibleQuestions[currentIndex + 1].id;
}

/**
 * Get previous question ID
 */
export function getPreviousQuestionId(currentId: number, data: Partial<ProfileFormData>): number | null {
  const visibleQuestions = getVisibleQuestions(data);
  const currentIndex = visibleQuestions.findIndex((q) => q.id === currentId);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return visibleQuestions[currentIndex - 1].id;
}



