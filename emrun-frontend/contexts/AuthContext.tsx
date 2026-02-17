/**
 * AuthContext
 * Manages authentication state and user data across the app
 * Provides auth methods, profile, plan data with caching
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, type User } from '@/lib/api/auth';
import { profileApi } from '@/lib/api/profile';
import { plansApi } from '@/lib/api/plans';
import type { Plan } from '@/types/plan';
import { getStoredToken, clearTokens, isAuthenticated } from '@/lib/utils/auth';

interface ProfileData {
  questionnaire_completed: boolean;
  [key: string]: any;
}

interface AuthContextType {
  // Auth state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Profile state (cached)
  profile: ProfileData | null;
  questionnaireCompleted: boolean;

  // Plan state (cached)
  activePlan: Plan | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, sessionId?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Data refresh actions
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshPlan: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Cache duration: 2 minutes (more aggressive for smoother navigation)
const CACHE_DURATION = 2 * 60 * 1000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastProfileFetch, setLastProfileFetch] = useState(0);
  const [lastPlanFetch, setLastPlanFetch] = useState(0);

  // Check for stored auth on mount
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      setIsLoading(true);
      const hasToken = await isAuthenticated();

      if (hasToken) {
        // Fetch user, profile, and plan in parallel
        const [userResponse, profileResponse, planResponse] = await Promise.allSettled([
          authApi.getCurrentUser(),
          profileApi.getProfile(),
          plansApi.getActivePlan(),
        ]);

        if (userResponse.status === 'fulfilled') {
          setUser(userResponse.value.user);
        }

        if (profileResponse.status === 'fulfilled') {
          setProfile(profileResponse.value.profile);
          setLastProfileFetch(Date.now());
        }

        if (planResponse.status === 'fulfilled') {
          setActivePlan(planResponse.value.plan);
          setLastPlanFetch(Date.now());
        }
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
      await clearTokens();
      setUser(null);
      setProfile(null);
      setActivePlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);

    // Load profile and plan after login
    try {
      const [profileResponse, planResponse] = await Promise.allSettled([
        profileApi.getProfile(),
        plansApi.getActivePlan(),
      ]);

      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.profile);
        setLastProfileFetch(Date.now());
      }

      if (planResponse.status === 'fulfilled') {
        setActivePlan(planResponse.value.plan);
        setLastPlanFetch(Date.now());
      }
    } catch (e) {
      // Non-critical, continue without profile/plan
    }
  };

  const register = async (email: string, password: string, name: string, sessionId?: string) => {
    const response = await authApi.register({
      email,
      password,
      password_confirmation: password,
      name,
      session_uuid: sessionId,
    });
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setActivePlan(null);
      setLastProfileFetch(0);
      setLastPlanFetch(0);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    // Skip if recently fetched
    if (Date.now() - lastProfileFetch < CACHE_DURATION) {
      return;
    }

    try {
      const response = await profileApi.getProfile();
      setProfile(response.profile);
      setLastProfileFetch(Date.now());
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [lastProfileFetch]);

  const refreshPlan = useCallback(async () => {
    // Skip if recently fetched
    if (Date.now() - lastPlanFetch < CACHE_DURATION) {
      return;
    }

    try {
      const response = await plansApi.getActivePlan();
      setActivePlan(response.plan);
      setLastPlanFetch(Date.now());
    } catch (error) {
      console.error('Failed to refresh plan:', error);
    }
  }, [lastPlanFetch]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshUser(),
      refreshProfile(),
      refreshPlan(),
    ]);
  }, [refreshUser, refreshProfile, refreshPlan]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    profile,
    questionnaireCompleted: profile?.questionnaire_completed === true,
    activePlan,
    login,
    register,
    logout,
    refreshUser,
    refreshProfile,
    refreshPlan,
    refreshAll,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
