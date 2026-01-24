---
created: 2026-01-24T21:56
title: Implement multi-step onboarding questionnaire with wheel pickers
area: ui
files:
  - emrun-frontend/
---

## Problem

Client wants a polished multi-step onboarding questionnaire for RUNLINE running app. Each question should be on its own screen with:
- Progress indicator (e.g., "2/4" shown in screenshot)
- Wheel picker UI for numeric/selection inputs (age, weight, height, volume, experience)
- Clean UX matching the provided screenshot aesthetic
- 9 total steps with conditional logic based on user choices

Reference screenshot shows: Dark theme, centered content, wheel picker for age selection, "Continuer →" button, back arrow navigation.

## Solution

**Suggested step order (optimized for UX):**

1. **Email capture** (move to first - capture lead early before drop-off)
   - Text input
   - Save to contact DB even if incomplete

2. **Main objective** (required)
   - Radio buttons: "Me préparer à course(s)", "Commencer", "Reprendre", "Autre"
   - Conditional follow-ups:
     - If "Me préparer": Distance (5km/10km/semi/marathon/autre), Date, Optional: intermediate goals, personal records
     - If "Reprendre": Optional personal records

3. **Basic info** (required)
   - Nom/Prénom: Text input
   - Âge: Wheel picker (like screenshot)
   - Sexe: Radio (Homme/Femme)
   - Poids: Wheel picker (kg)
   - Taille: Wheel picker (cm)

4. **Current volume** (required)
   - Wheel picker: 0km/sem to 150km+/sem
   - Increments: 5km up to 30km, then 10km up to 150km

5. **Weekly runs** (required)
   - Radio with fun labels:
     - "Pas du tout (0)"
     - "Un peu (1/2)"
     - "Beaucoup (3/4)"
     - "Passionnément (5/6)"
     - "A la folie (7+)"

6. **Available days** (required)
   - Multi-select checkboxes: Lun-Dim

7. **Running experience** (required)
   - Wheel picker: "Je commence", "1-11 mois", "1-10 ans", "+10 ans"

8. **Training locations** (required)
   - Multi-select: Route, Chemins, Piste, Tapis, Autre (text input)

9. **Constraints** (optional)
   - Blessures passées (text + date)
   - Contraintes perso/pro (text)

**Technical approach:**
- React Native wheel picker component or custom implementation
- Form state management (React Hook Form or similar)
- Conditional rendering based on step 2 choice
- Progress tracking (current step / total steps)
- Back navigation preserves state
- Save email to backend on step 1 completion

**UI components needed:**
- WheelPicker component (age, weight, height, volume, experience)
- ProgressBar component
- StepContainer layout
- ContinueButton component
- BackButton component
