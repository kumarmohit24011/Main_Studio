
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface ShippingSettings {
  fee: number;
  threshold: number;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const siteContentRef = doc(db, 'siteContent', 'global');
    const docSnap = await getDoc(siteContentRef);

    if (docSnap.exists()) {
        const settings = docSnap.data()?.shippingSettings;
        // Provide default values if the settings are not configured in the DB
        if (settings) {
            return {
                fee: settings.defaultFee ?? 50, 
                threshold: settings.freeShippingThreshold ?? 1000 
            };
        }
    }
    
    // Return default values if the document or settings object don't exist
    return { fee: 50, threshold: 1000 };

  } catch (error) {
    console.error("Error fetching shipping settings from Firestore:", error);
    // On error, return default values so the cart doesn't break
    return { fee: 50, threshold: 1000 };
  }
}
