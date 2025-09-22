
import { auth, db } from '@/lib/firebase';
import { UserProfile, StoredAddress } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const toPlainObject = (user: any): UserProfile => {
    if (!user) return user;
    const plain = { ...user };
    if (user.createdAt?.seconds) {
        plain.createdAt = new Date(user.createdAt.seconds * 1000).toISOString();
    }
    return plain;
};

export const createUserProfile = async (uid: string, email: string, name: string, photoURL?: string): Promise<UserProfile> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        console.log(`Profile for user ${uid} already exists.`);
        return toPlainObject(docSnap.data());
    }

    // More flexible admin system - check for admin emails list or existing admin users
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || ['admin@redbow.com'];
    const isAdmin = adminEmails.some(adminEmail => adminEmail.trim().toLowerCase() === email.toLowerCase());

    const userProfile: UserProfile = {
        uid,
        email,
        name,
        photoURL: photoURL || '',
        createdAt: serverTimestamp(),
        wishlist: [],
        cart: [],
        addresses: [], // Initialize with empty addresses array
        isAdmin,
    };
    
    try {
        await setDoc(userRef, userProfile);
        // We can't return userProfile directly because createdAt is a serverTimestamp
        // A full-fledged solution might re-fetch, but for our case, this is sufficient for the client state
        const profile = await getUserProfile(uid);
        return profile!;

    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    if (!db) {
        console.error("Firestore not initialized");
        return null;
    }
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return toPlainObject(docSnap.data());
        } else {
            console.warn(`No profile found for user ${uid}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const getAllCustomers = async (): Promise<UserProfile[]> => {
     try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => toPlainObject(doc.data()));
    } catch (error) {
        console.error("Error fetching all customers: ", error);
        throw new Error(`Failed to fetch customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getTotalCustomers = async (): Promise<number> => {
    try {
        const usersCol = collection(db, 'users');
        const snapshot = await getCountFromServer(usersCol);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error fetching user count: ", error);
        throw new Error(`Failed to fetch user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getRecentCustomers = async (count: number): Promise<UserProfile[]> => {
     try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy("createdAt", "desc"), limit(count));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => toPlainObject(doc.data() as UserProfile));
    } catch (error) {
        console.error("Error fetching recent customers: ", error);
        throw new Error(`Failed to fetch recent customers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


export const updateUserProfile = async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>): Promise<void> => {
    if (!db) {
        console.error("Firestore not initialized");
        return;
    }
    try {
        const userRef = doc(db, 'users', uid);

        // If updating addresses, ensure any new default address unsets the old one
        if (data.addresses) {
            const newAddresses = [...data.addresses];
            const newDefaultIndex = newAddresses.findIndex(addr => addr.isDefault);

            if (newDefaultIndex > -1) {
                data.addresses = newAddresses.map((addr, index) => ({
                    ...addr,
                    isDefault: index === newDefaultIndex
                }));
            }
        }
        
        // Update Firestore document
        await updateDoc(userRef, data);

        // Also update Firebase Auth profile if name or photoURL is changed
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
            const authUpdateData: { displayName?: string; photoURL?: string } = {};
            if (data.name) {
                authUpdateData.displayName = data.name;
            }
            if (data.photoURL) {
                authUpdateData.photoURL = data.photoURL;
            }
            if (Object.keys(authUpdateData).length > 0) {
                await updateProfile(currentUser, authUpdateData);
            }
        }

    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};
