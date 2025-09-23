
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
    console.log(`[addSubscriber] Received request to subscribe email: ${email}`);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.warn('[addSubscriber] Invalid email provided.');
        return { success: false, message: 'Please provide a valid email address.' };
    }

    try {
        const emailId = email.toLowerCase();
        const subscriberRef = doc(db, 'subscribers', emailId);
        
        console.log(`[addSubscriber] Checking for existing subscriber with ID: ${emailId}`);
        const docSnap = await getDoc(subscriberRef);

        if (docSnap.exists()) {
            console.log(`[addSubscriber] Email already exists: ${emailId}`);
            return { success: true, message: 'This email is already subscribed. Thank you!' };
        }

        console.log(`[addSubscriber] Email does not exist. Creating new subscriber: ${emailId}`);
        await setDoc(subscriberRef, {
            email: emailId,
            createdAt: serverTimestamp(),
        });
        console.log(`[addSubscriber] Successfully created subscriber: ${emailId}`);

        return { success: true, message: 'Thank you for subscribing!' };
    } catch (error) {
        console.error("[addSubscriber] An error occurred: ", error);
        // Return a generic error message to the user for security.
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
};
