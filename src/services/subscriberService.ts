
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * Adds a new email address to the subscribers collection in Firestore.
 *
 * @param email The email address to add.
 * @returns An object with success status and a message.
 */
export const addSubscriber = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please provide a valid email address.' };
    }

    try {
        // Use the email as the document ID for easy duplicate checking.
        // Firestore is case-sensitive, so convert to lowercase to prevent duplicates.
        const emailId = email.toLowerCase();
        const subscriberRef = doc(db, 'subscribers', emailId);
        const docSnap = await getDoc(subscriberRef);

        if (docSnap.exists()) {
            return { success: true, message: 'This email is already subscribed. Thank you!' };
        }

        await setDoc(subscriberRef, {
            email: emailId,
            createdAt: serverTimestamp(),
        });

        return { success: true, message: 'Thank you for subscribing!' };
    } catch (error) {
        console.error("Error adding subscriber: ", error);
        // Return a generic error message to the user for security.
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
};
