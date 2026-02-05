# 🔍 ANALYSE COMPLÈTE DU USER STORY - FLOW UTILISATEUR

**Date:** 2026-01-21  
**User Story:** "User opens app → Get Started → Questionnaire → Signup → Profile stored → Can view/edit"

---

## ✅ CE QUI FONCTIONNE (Backend)

### 1. Backend - Questionnaire Sessions ✅
- ✅ `POST /api/questionnaire/sessions` - Crée session anonyme
- ✅ `PUT /api/questionnaire/sessions/{uuid}` - Met à jour session (merge correct)
- ✅ Stockage dans `questionnaire_sessions` table
- ✅ `session_uuid` généré automatiquement

### 2. Backend - Signup avec session_uuid ✅
- ✅ `POST /api/auth/register` accepte `session_uuid` (optionnel)
- ✅ `AuthService::register()` attache automatiquement la session
- ✅ `QuestionnaireSessionController::attachFromSignup()` transfère vers `user_profiles`
- ✅ Transaction DB garantit l'intégrité
- ✅ Plan généré automatiquement si première complétion

### 3. Backend - Profile Management ✅
- ✅ `GET /api/profile` - Récupère profil utilisateur
- ✅ `PUT /api/profile` - Met à jour profil (tous les champs)
- ✅ `ProfileService::updateProfile()` gère validation complète
- ✅ Supporte édition de tous les champs questionnaire

### 4. Backend - Password Change ✅
- ✅ `POST /api/auth/change-password` - Change password
- ✅ `PUT /api/auth/account` - Met à jour name/email

---

## ❌ PROBLÈMES IDENTIFIÉS (Frontend)

### 1. ❌ CRITIQUE: Step8 essaie de sauvegarder profile sans auth

**Fichier:** `app/(questionnaire)/step8.tsx`  
**Ligne:** 46

**Problème:**
```typescript
// ACTUEL (INCORRECT)
const response = await profileApi.updateProfile(payload);
```

**Pourquoi c'est cassé:**
- L'utilisateur est **anonyme** (pas encore inscrit)
- `profileApi.updateProfile()` nécessite JWT token (endpoint protégé)
- L'appel échoue avec 401 Unauthorized
- L'utilisateur ne peut pas terminer le questionnaire

**Solution:**
- Marquer la session comme `completed: true` via `questionnaireApi.updateSession()`
- Rediriger vers `/register` avec `session_uuid` dans AsyncStorage
- Le signup attachera automatiquement la session

---

### 2. ❌ Session UUID pas marquée comme completed avant signup

**Fichier:** `app/(questionnaire)/step8.tsx`

**Problème:**
- Le frontend ne marque jamais `completed: true` sur la session
- Le backend vérifie `completed` avant attach (optionnel mais recommandé)

**Solution:**
- Appeler `questionnaireApi.updateSession(sessionUuid, finalPayload, true)` avant redirection

---

### 3. ⚠️ Redirection après completion incorrecte

**Fichier:** `app/(questionnaire)/step8.tsx`  
**Ligne:** 56

**Problème:**
```typescript
// ACTUEL
onPress: () => router.replace('/'),
```

**Pourquoi c'est cassé:**
- Redirige vers l'écran d'accueil au lieu de `/register`
- L'utilisateur ne sait pas qu'il doit s'inscrire
- La session reste anonyme

**Solution:**
- Rediriger vers `/(auth)/register` après completion

---

### 4. ⚠️ Profile Response Type incorrect

**Fichier:** `types/profile.ts`

**Problème:**
```typescript
// ACTUEL (INCORRECT)
export interface UserProfileResponse {
  data: {
    profile: UserProfileFormData;
    questionnaire_completed: boolean;
  };
}
```

**Pourquoi c'est cassé:**
- `apiClient.extractData()` extrait déjà le `data` du backend
- Le frontend reçoit directement `{ profile, questionnaire_completed }`
- Type TypeScript ne correspond pas à la réalité

**Solution:**
```typescript
export interface UserProfileResponse {
  profile: UserProfileFormData | null;
  questionnaire_completed: boolean;
}
```

---

### 5. ⚠️ Code utilise response.data.* au lieu de response.*

**Fichiers affectés:**
- `app/(tabs)/profile.tsx` (lignes 22, 44-46, 51-52, 138, 157)
- `app/(tabs)/home.tsx` (lignes 36-48)
- `app/(questionnaire)/_layout.tsx` (lignes 55-56)

**Problème:**
- Code utilise `response.data.profile` alors que c'est `response.profile`
- Code utilise `response.data.questionnaire_completed` alors que c'est `response.questionnaire_completed`

**Solution:**
- Remplacer tous les `response.data.*` par `response.*`

---

### 6. ⚠️ Refresh Token Response Format

**Fichier:** `lib/api/client.ts`  
**Ligne:** 93

**Problème:**
```typescript
// ACTUEL (INCORRECT)
const { access_token, refresh_token: newRefreshToken } = response.data.data;
```

**Solution:**
```typescript
const { access_token, refresh_token: newRefreshToken } = response.data;
```

---

### 7. ⚠️ race_distance_other non supporté par backend

**Fichiers:**
- `lib/validation/profileSchema.ts` (ligne 43)
- `lib/questionnaire/questions.ts` (lignes 144-154)

**Problème:**
- Frontend définit `race_distance_other` mais backend ne le supporte pas
- Backend n'accepte que `5km|10km|semi_marathon|marathon` (pas "other")

**Solution:**
- Supprimer `race_distance_other` du frontend
- Supprimer option "other" de `race_distance` enum
- Supprimer question conditionnelle `race_distance_other`

---

## 📋 FLOW ATTENDU vs FLOW ACTUEL

### ✅ FLOW ATTENDU (Correct)

```
1. User ouvre app
   → Écran d'accueil avec "Get Started"

2. User clique "Get Started"
   → Redirige vers /(questionnaire)/step1
   → Crée session anonyme (session_uuid stocké)

3. User remplit questionnaire (steps 1-8)
   → Chaque changement autosave vers session
   → Session UUID stocké dans AsyncStorage

4. User termine step8
   → Marque session completed: true
   → Redirige vers /(auth)/register

5. User s'inscrit
   → Frontend récupère session_uuid depuis AsyncStorage
   → POST /api/auth/register avec { session_uuid }
   → Backend attache automatiquement la session
   → Profil créé dans user_profiles
   → Plan généré (si première fois)

6. User redirigé vers /(tabs)/profile
   → Voit toutes ses réponses
   → Peut éditer via "Edit Profile" → retourne à questionnaire

7. User peut éditer profil
   → PUT /api/profile avec nouveaux champs
   → Backend met à jour user_profiles
   → Changements persistés
```

### ❌ FLOW ACTUEL (Cassé)

```
1. ✅ User ouvre app → Écran d'accueil OK

2. ✅ User clique "Get Started" → Redirige vers step1 OK

3. ✅ User remplit questionnaire → Autosave OK

4. ❌ User termine step8
   → Essaie profileApi.updateProfile() (requiert auth)
   → Échoue avec 401 Unauthorized
   → Redirige vers / (au lieu de /register)
   → Session jamais attachée

5. ❌ User ne peut pas s'inscrire avec session
   → Session reste anonyme
   → Données perdues si session expire
```

---

## 🎯 CORRECTIONS NÉCESSAIRES

### Priorité CRITIQUE

1. **Corriger step8.tsx** - Ne pas appeler `profileApi.updateProfile()` pour utilisateur anonyme
2. **Marquer session completed** - Appeler `updateSession(..., completed: true)` avant signup
3. **Rediriger vers register** - Au lieu de `/` après completion

### Priorité HAUTE

4. **Corriger UserProfileResponse type** - Structure incorrecte
5. **Corriger tous les `response.data.*`** - Utiliser `response.*` directement
6. **Corriger refresh token** - `response.data.data` → `response.data`

### Priorité MOYENNE

7. **Supprimer race_distance_other** - Non supporté par backend

---

## ✅ BACKEND - RIEN À CHANGER

Le backend est **100% fonctionnel** et supporte déjà:
- ✅ Sessions anonymes
- ✅ Attach automatique lors du signup
- ✅ Profile management complet
- ✅ Édition de tous les champs
- ✅ Password change
- ✅ Account update

**Aucune modification backend nécessaire.**

---

**Généré le:** 2026-01-21
