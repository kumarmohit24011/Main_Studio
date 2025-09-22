
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile } from '@/services/userService';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';

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

  const refreshUserProfile = useCallback(async () => {
    if (user) {
        setAuthLoading(true);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setAuthLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setUser(user);
        let profile = await getUserProfile(user.uid);
        if (!profile) {
            // This can happen if a user signs in but their profile creation was interrupted.
            // We create it here to be safe.
            profile = await createUserProfile(user.uid, user.email!, user.displayName || 'New User', user.photoURL || undefined);
        }
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // This base context value is minimal, the real implementation is in the `useAuth` hook
  const value = {
    user,
    userProfile,
    authLoading,
    refreshUserProfile,
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
    signOutUser: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(redirectUrl?: string) {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleAuthSuccess = (profile: UserProfile | null) => {
    const finalRedirectUrl = redirectUrl || (profile?.isAdmin ? '/admin' : '/');
    router.push(finalRedirectUrl);
  }

  const handleAuthError = (error: any) => {
    console.error("Authentication error: ", error);
    throw error;
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName, photoURL } = result.user;
      
      // Check if user profile exists, if not, create it
      let profile = await getUserProfile(uid);
      if (!profile) {
        profile = await createUserProfile(uid, email!, displayName || 'New User', photoURL || undefined);
      }
      
      handleAuthSuccess(profile);
    } catch (error) {
      // Don't re-throw the error here to avoid unhandled promise rejections on the client
      console.error("Google sign-in failed", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
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
      const newProfile = await createUserProfile(userCredential.user.uid, email, displayName);
      handleAuthSuccess(newProfile);
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

  // Return the original context spread with our new methods
  return { ...context, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser };
}
