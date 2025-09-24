
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    signOut, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile, 
    signInWithRedirect,
    getRedirectResult,
    UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/services/userService';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  refreshUserProfile: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUserProfile = useCallback(async (currentUser: User | null = auth.currentUser) => {
    if (currentUser) {
      setAuthLoading(true);
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    authLoading,
    refreshUserProfile,
    signInWithGoogle: async () => { console.warn('signInWithGoogle not implemented'); },
    signInWithEmail: async () => { console.warn('signInWithEmail not implemented'); },
    signUpWithEmail: async () => { console.warn('signUpWithEmail not implemented'); },
    signOutUser: async () => { console.warn('signOutUser not implemented'); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(redirectUrl?: string) {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleAuthError = useCallback((error: any) => {
    console.error("Authentication error: ", error);
    // Potentially show a toast notification to the user
    throw error;
  }, []);

  const handleAuthSuccess = useCallback((profile: UserProfile | null) => {
    const finalRedirectUrl = redirectUrl || (profile?.isAdmin ? '/admin' : '/');
    router.push(finalRedirectUrl);
  }, [redirectUrl, router]);

  const forceRefresh = useCallback(async (user: User) => {
    await user.getIdToken(true);
    await context.refreshUserProfile(user);
  }, [context]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          let profile = await getUserProfile(result.user.uid);
          if (!profile) {
            profile = await createUserProfile(result.user.uid, result.user.email!, result.user.displayName || 'New User', result.user.photoURL || undefined);
          }
          await forceRefresh(result.user);
          handleAuthSuccess(profile);
        }
      } catch (error) {
        if ((error as any).code !== 'auth/redirect-cancelled') {
            handleAuthError(error);
        }
      }
    };

    if (!context.authLoading) {
        handleRedirectResult();
    }
  }, [context.authLoading, forceRefresh, handleAuthSuccess, handleAuthError]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await forceRefresh(result.user);
      const profile = await getUserProfile(result.user.uid);
      handleAuthSuccess(profile);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      const newUserProfile = await createUserProfile(userCredential.user.uid, email, displayName);
      await forceRefresh(userCredential.user);
      handleAuthSuccess(newUserProfile);
    } catch (error) {
       handleAuthError(error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return { ...context, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser };
}
