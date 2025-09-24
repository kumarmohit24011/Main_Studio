
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
    signInWithPopup
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(redirectUrl?: string) {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleAuthError = (error: any) => {
    console.error("Authentication error: ", error);
    throw error;
  };

  const handleAuthSuccess = useCallback((profile: UserProfile | null) => {
    const finalRedirectUrl = redirectUrl || (profile?.isAdmin ? '/admin' : '/');
    router.push(finalRedirectUrl);
  },[redirectUrl, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await context.refreshUserProfile(); 

      let profile = await getUserProfile(user.uid);
      if (!profile) {
        profile = await createUserProfile(user.uid, user.email!, user.displayName || 'New User', user.photoURL || undefined);
        await context.refreshUserProfile();
      }
      handleAuthSuccess(profile);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.error('Sign-in popup closed by user.');
      } else {
        handleAuthError(error);
      }
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
      const newUserProfile = await createUserProfile(userCredential.user.uid, email, displayName);
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

  return { ...context, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, handleAuthSuccess };
}
