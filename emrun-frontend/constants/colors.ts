/**
 * Color palette for Emrun app
 * Dark theme – fond principal #111921
 */

const MAIN_BG = '#111921';

export const colors = {
  primary: {
    dark: MAIN_BG,         // Fond principal (body, surfaces sombres)
    darker: '#0d1117',     // Plus foncé
    medium: '#1a2632',     // Surfaces (cartes, boutons secondaires)
    light: '#344d65',      // Bordures, éléments surélevés
  },
  accent: {
    blue: '#328ce7',
    cyan: '#00d4ff',
    darkBlue: '#0044cc',
  },
  text: {
    primary: '#ffffff',
    secondary: '#93adc8',
    tertiary: '#587a9a',
    inverse: '#000000',
  },
  background: {
    primary: MAIN_BG,
    secondary: MAIN_BG,
    card: '#1a2632',
    elevated: '#1a2632',
  },
  border: {
    light: '#344d65',
    medium: '#344d65',
    dark: '#1a2632',
  },
  status: {
    success: '#00ff88',
    error: '#ff4444',
    warning: '#ffaa00',
    info: '#0066ff',
  },
};



