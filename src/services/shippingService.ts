
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface ShippingFee {
  id: string;
  name: string;
  fee: number;
}

export async function getShippingFees(): Promise<ShippingFee[]> {
  try {
    const shippingRef = doc(db, 'siteContent', 'global', 'shipping', 'defaultFee');
    const docSnap = await getDoc(shippingRef);

    if (!docSnap.exists()) {
      console.log('No default shipping fee found in the database.');
      return [];
    }

    const data = docSnap.data();
    const fee: ShippingFee = {
        id: docSnap.id,
        name: data.name || 'Standard Shipping',
        fee: data.fee || 0
    };
    
    return [fee];
  } catch (error) {
    console.error("Error fetching shipping fees from Firestore:", error);
    throw new Error('Failed to fetch shipping fees.');
  }
}
