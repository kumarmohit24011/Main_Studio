
import { db } from '@/lib/firebase';
import { Coupon } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { triggerCacheRevalidation } from '@/lib/cache-client';

const couponsCol = collection(db, 'coupons');

const toPlainObject = (coupon: any): Coupon => {
    if (!coupon) return coupon;
    const plain = { ...coupon };
    if (coupon.createdAt?.seconds) {
        plain.createdAt = new Date(coupon.createdAt.seconds * 1000).toISOString();
    }
    return plain;
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
    try {
        const snapshot = await getDocs(couponsCol);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() })).sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
        console.error("Error fetching coupons: ", error);
        throw error;
    }
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
     try {
        const q = query(couponsCol, where("code", "==", code));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Coupon;
    } catch (error) {
        console.error("Error fetching coupon by code: ", error);
        throw error;
    }
}

export const addCoupon = async (coupon: Omit<Coupon, 'id' | 'createdAt'>): Promise<void> => {
    try {
        // Check if coupon code already exists
        const existingCoupon = await getCouponByCode(coupon.code);
        if (existingCoupon) {
            throw new Error('A coupon with this code already exists.');
        }

        await addDoc(couponsCol, {
            ...coupon,
            createdAt: serverTimestamp(),
        });
        await triggerCacheRevalidation('coupons');
    } catch (error) {
        console.error("Error adding coupon: ", error);
        throw error;
    }
};

export const updateCoupon = async (id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const couponRef = doc(db, 'coupons', id);
        await updateDoc(couponRef, data);
        await triggerCacheRevalidation('coupons');
    } catch (error) {
        console.error("Error updating coupon: ", error);
        throw error;
    }
};

export const deleteCoupon = async (id: string): Promise<void> => {
    try {
        const couponRef = doc(db, 'coupons', id);
        await deleteDoc(couponRef);
        await triggerCacheRevalidation('coupons');
    } catch (error) {
        console.error("Error deleting coupon: ", error);
        throw error;
    }
}
