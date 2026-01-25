# Coding Conventions

**Analysis Date:** 2026-01-24

## Naming Patterns

**Files:**
- React/TypeScript components: PascalCase (e.g., `TextInputField.tsx`, `LoginScreen`, `Button.tsx`)
- Services and utilities: camelCase (e.g., `autosaveService.ts`, `authApi.ts`, `profileSchema.ts`)
- Contexts: PascalCase (e.g., `NotificationContext.tsx`, `QuestionnaireContext.tsx`)
- Constants: camelCase for objects, UPPER_SNAKE_CASE for individual constants (e.g., `colors` object, `DEBOUNCE_DELAY`)
- Test files: `.test.ts` or `.spec.ts` suffix
- Layout and page files in app directory: lowercase or kebab-case with parentheses for group folders: `(auth)`, `(tabs)`, `(questionnaire)`

**Functions:**
- camelCase for regular functions
- Exported functions use descriptive verb names: `getStoredToken()`, `storeTokens()`, `clearTokens()`, `isAuthenticated()`
- Private methods (TypeScript): prefixed with underscore `private logApiUrl()`, `private extractData<T>()`
- Callback props: `onPress`, `onChangeText`, `onSubmit` (on+PascalCase pattern)

**Variables:**
- camelCase for all variables: `isLoading`, `setIsLoading`, `sessionUuid`, `errorMessage`
- React hooks: camelCase with descriptive names following `use` prefix: `useRouter()`, `useForm()`, `useNotification()`
- Storage keys: UPPER_SNAKE_CASE constants: `TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `QUESTIONNAIRE_SESSION_UUID`

**Types:**
- Interfaces: PascalCase, often with `Props` suffix for component props: `TextInputFieldProps`, `ButtonProps`, `NotificationContextType`
- Type aliases: PascalCase: `NotificationType = 'success' | 'error' | 'info' | 'warning'`, `LoginFormData`
- Enum-like union types: lowercase strings: `type NotificationType = 'success' | 'error'`

**API/Models:**
- PHP Models: PascalCase (e.g., `User.php`, `QuestionnaireSession.php`, `UserProfile.php`)
- Service classes: PascalCase ending with `Service` (e.g., `AuthService.php`, `NotificationService.php`, `AutosaveService.ts`)
- Controllers: PascalCase ending with `Controller` (e.g., `AuthController.php`)

## Code Style

**Formatting:**
- TypeScript: 2-space indentation
- PHP: 4-space indentation (Laravel convention)
- Line length: Typically followed naturally, no hard limit enforced
- No strict formatter configured in emrun-frontend (no ESLint config found, uses tsconfig with strict mode)

**Linting:**
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- PHP: Laravel default conventions (PSR-12 style)
- No ESLint or Prettier config present in frontend - code quality relies on TypeScript strict mode

**Semicolons:**
- Always present in TypeScript/JavaScript code
- Present in PHP code

## Import Organization

**Order:**
1. React and React Native imports
2. External library imports (expo, axios, react-hook-form, zod, etc.)
3. Local module imports (with path aliases)
4. Type imports (TypeScript)

**Path Aliases:**
- Frontend: `@/*` → root of `emrun-frontend` directory
  - Used for: `@/components`, `@/lib`, `@/contexts`, `@/constants`
- Configured in `tsconfig.json` and `babel.config.js`
- Example: `import { TextInputField } from '@/components/forms/TextInputField'`

**Example from `login.tsx`:**
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validation/authSchema';
import { TextInputField } from '@/components/forms/TextInputField';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
```

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations and network calls
- Error objects typed as `error: any` in catch blocks, then conditionally narrowed
- Check `error.response` for Axios errors, access `error.response.status` and `error.response.data`
- Network errors detected by checking `error.message.includes('Network')`

**Example from `login.tsx`:**
```typescript
try {
  await authApi.login({
    email: data.email,
    password: data.password,
  });
  // Success logic
} catch (error: any) {
  let errorMessage = 'Default error message';

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      errorMessage = 'Specific 401 message';
    } else if (status === 422) {
      // Handle validation errors
      if (data?.errors) {
        const errorDetails = Object.values(data.errors).flat().join('\n');
        errorMessage = `Error:\n${errorDetails}`;
      }
    }
  } else if (error.message) {
    if (error.message.includes('Network')) {
      errorMessage = 'Network error message';
    }
  }

  Alert.alert('Alert Title', errorMessage);
} finally {
  setIsLoading(false);
}
```

**API Client pattern from `client.ts`:**
- Interceptor-based approach: Request interceptor adds JWT token, response interceptor handles 401 refresh
- `validateStatus: (status) => status < 600` allows all status codes through (not thrown)
- Response extraction via `extractData<T>()` method that checks `{ success: true, data: {...} }` structure
- If `success` is false, throws error with message

**PHP Exception Handling:**
```php
if ($validator->fails()) {
    throw new \Illuminate\Validation\ValidationException($validator);
}
```

## Logging

**Framework:** console API in TypeScript, `Log` facade in Laravel

**Patterns:**
- Frontend: `console.log()`, `console.error()` with context messages
- Backend: `Log::info()`, `Log::warning()`, `Log::error()` with arrays of context data
- Debug logging: Conditional on `__DEV__` flag in React Native

**Examples:**
```typescript
// Frontend - conditional dev logging
if (__DEV__) {
  console.log('🔗 API URL:', API_URL);
  console.log('📱 Using API URL from:', process.env.EXPO_PUBLIC_API_URL ? 'EXPO_PUBLIC_API_URL env var' : 'default');
}

// Frontend - error logging
console.error('Reset session error:', error);

// Backend - context logging
Log::info('Session attached automatically during signup', [
    'user_id' => $user->id,
    'session_uuid' => $data['session_uuid'],
]);

Log::error('Failed to attach session during signup', [
    'user_id' => $user->id,
    'session_uuid' => $data['session_uuid'],
    'error' => $e->getMessage(),
]);
```

## Comments

**When to Comment:**
- File-level JSDoc comment at top explaining purpose (seen in `client.ts`, `authSchema.ts`, `auth.ts`)
- Method-level comments for complex logic or API interaction
- Inline comments for non-obvious business logic
- French comments in French-language code sections (Laravel backend)

**JSDoc/TSDoc:**
```typescript
/**
 * API Client Configuration
 * Handles all HTTP requests to the Laravel backend
 * Includes JWT token management and automatic token refresh
 */
```

```php
/**
 * Register a new user.
 *
 * @param array $data
 * @return array
 * @throws \Illuminate\Validation\ValidationException
 */
public function register(array $data): array
```

## Function Design

**Size:**
- Small focused functions (20-50 lines typical)
- Larger functions in API clients (~200 lines) are acceptable for complex logic like token refresh

**Parameters:**
- Data objects/interfaces preferred over multiple primitives
- Destructuring used for props: `{ label, error, required = false, helperText, ...textInputProps }`
- Generic types used for reusable data extraction: `extractData<T>(response)`

**Return Values:**
- Async functions return Promises with typed generics: `async initialize(): Promise<string | null>`
- Void-returning functions used for side effects: `async save(data: ...): Promise<void>`
- Nullable returns indicated in type: `Promise<string | null>`

**Example from `TextInputField.tsx`:**
```typescript
interface TextInputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  required = false,
  helperText,
  ...textInputProps
}) => {
  // Component logic
}
```

## Module Design

**Exports:**
- Named exports for components and utilities
- Default exports in some cases (screen components in app directory may use default)
- Singleton exports for services: `export const autosaveService = new AutosaveService()`
- Single export per module pattern: `export const apiClient = new ApiClient()`

**Barrel Files:**
- Not observed in this codebase - direct imports from specific files preferred
- Each file has single responsibility

**Example exports:**
```typescript
// Singleton service
export const autosaveService = new AutosaveService();

// Named component export
export const TextInputField: React.FC<TextInputFieldProps> = ({ ... });

// Named hook export
export function useNotification() { ... }

// Named utility exports
export async function getStoredToken(): Promise<string | null> { ... }
export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> { ... }
```

## Platform-Specific Code

**Web/Mobile Compatibility:**
- `Platform.OS` checks used to differentiate: `if (Platform.OS === 'web')` vs AsyncStorage
- localStorage used directly for web, AsyncStorage for native
- Example from `auth.ts`:
```typescript
async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return null;
  }
}
```

## Styling

**React Native:**
- `StyleSheet.create()` used for all styles
- Styles defined at end of file (after component)
- No inline styles except for dynamic values
- Color constants imported from `@/constants/colors`

**Example:**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
```

---

*Convention analysis: 2026-01-24*
