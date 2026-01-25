/**
 * Zod validation schemas for authentication
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Veuillez entrer une adresse email valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Veuillez entrer une adresse email valide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;






