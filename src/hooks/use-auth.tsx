
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
            try {
                profile = await createUserProfile(user.uid, user.email!, user.displayName || 'New User', user.photoURL || undefined);
            } catch (error) {
                console.error("Failed to create user profile after multiple retries.", error);
                // You might want to sign out the user or show a more specific error message
            }
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

  useEffect(() => {
    const processRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                // The onAuthStateChanged listener will handle profile creation.
                // We just need to handle the successful redirect.
                const profile = await getUserProfile(result.user.uid);
                handleAuthSuccess(profile);
            }
        } catch (error) {
            console.error("Google sign-in redirect failed", error);
        }
    };
    if (!context.authLoading) {
        processRedirectResult();
    }
  }, [context.authLoading]);

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
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
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
      // onAuthStateChanged will handle profile creation. We can just redirect.
      handleAuthSuccess(null); // Redirect to a default page, the listener will fetch the right role
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
