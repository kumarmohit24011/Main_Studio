
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { triggerCacheRevalidation } from '@/lib/cache-client';

export interface HeroSectionData {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    updatedAt?: any;
}

export interface PromoBannerData {
    headline: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    updatedAt?: any;
}

export interface ShippingSettingsData {
    defaultFee: number;
    freeShippingThreshold: number;
    updatedAt?: any;
}

export interface SiteContent {
    heroSection: HeroSectionData;
    promoBanner1: PromoBannerData;
    promoBanner2: PromoBannerData;
    shippingSettings: ShippingSettingsData;
}

export type PlainShippingSettingsData = Omit<ShippingSettingsData, 'updatedAt'> & { updatedAt?: string };

// This is a serializable version of the data safe for client components
export type PlainSiteContent = {
    heroSection: Omit<HeroSectionData, 'updatedAt'> & { updatedAt?: string };
    promoBanner1: Omit<PromoBannerData, 'updatedAt'> & { updatedAt?: string };
    promoBanner2: Omit<PromoBannerData, 'updatedAt'> & { updatedAt?: string };
    shippingSettings: PlainShippingSettingsData;
};


const siteContentRef = doc(db, 'siteContent', 'global');

const defaultPromoBanner: PromoBannerData = {
    headline: 'Festive Discounts',
    subtitle: 'Up to 30% off on select necklaces',
    buttonText: 'Shop Now',
    buttonLink: '/products?category=Necklaces',
    imageUrl: 'https://picsum.photos/600/400',
    updatedAt: new Date()
};

const defaultData: SiteContent = {
    heroSection: {
        headline: 'Timeless Elegance, Redefined',
        subtitle: 'Discover our exclusive collection of handcrafted jewelry.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        imageUrl: 'https://picsum.photos/1800/1000',
        updatedAt: new Date()
    },
    promoBanner1: defaultPromoBanner,
    promoBanner2: {
        ...defaultPromoBanner,
        headline: 'Limited Time Offer',
        subtitle: 'Buy one, get one 50% off on wedding rings',
        buttonLink: '/products?category=Rings',
        imageUrl: 'https://picsum.photos/600/400?grayscale',
    },
    shippingSettings: {
        defaultFee: 50,
        freeShippingThreshold: 1000,
        updatedAt: new Date()
    }
};

const toPlainObject = (data: any): any => {
    if (!data) return null;
    const plain = { ...data };
    if (plain.updatedAt?.seconds) {
        plain.updatedAt = new Date(plain.updatedAt.seconds * 1000).toISOString();
    }
    return plain;
};

export const getSiteContent = async (): Promise<SiteContent> => {
    try {
        const docSnap = await getDoc(siteContentRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as SiteContent;
            // Ensure all fields have default values if they are missing and are serializable
            return {
                heroSection: toPlainObject(data.heroSection || defaultData.heroSection),
                promoBanner1: toPlainObject(data.promoBanner1 || defaultData.promoBanner1),
                promoBanner2: toPlainObject(data.promoBanner2 || defaultData.promoBanner2),
                shippingSettings: toPlainObject(data.shippingSettings || defaultData.shippingSettings),
            };
        } else {
            // Return default data instead of trying to create the document on server-side
            console.log("Site content document doesn't exist, returning defaults.");
            return {
                heroSection: toPlainObject(defaultData.heroSection),
                promoBanner1: toPlainObject(defaultData.promoBanner1),
                promoBanner2: toPlainObject(defaultData.promoBanner2),
                shippingSettings: toPlainObject(defaultData.shippingSettings),
            };
        }
    } catch (error) {
        console.error("Error fetching site content, returning defaults: ", error);
         const plainDefaultData = {
            heroSection: toPlainObject(defaultData.heroSection),
            promoBanner1: toPlainObject(defaultData.promoBanner1),
            promoBanner2: toPlainObject(defaultData.promoBanner2),
            shippingSettings: toPlainObject(defaultData.shippingSettings),
        };
        return plainDefaultData as SiteContent;
    }
};


export const updateHeroSection = async (data: Omit<HeroSectionData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        const updatePayload: Partial<SiteContent> = {};

        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            const storageRef = ref(storage, `hero-images/${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }

        updatePayload.heroSection = updateData;

        await setDoc(siteContentRef, updatePayload, { merge: true });
        await triggerCacheRevalidation('site-content');

    } catch (error) {
        console.error("Error in updateHeroSection:", error);
        throw error;
    }
};

export const updatePromoBanner = async (bannerId: 'promoBanner1' | 'promoBanner2', data: Omit<PromoBannerData, 'imageUrl' | 'updatedAt'>, imageFile?: File): Promise<void> => {
    try {
        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (imageFile) {
            const storageRef = ref(storage, `content-images/${bannerId}-${imageFile.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            updateData.imageUrl = await getDownloadURL(snapshot.ref);
        }
        
        const firestoreUpdate = { [bannerId]: updateData };

        await setDoc(siteContentRef, firestoreUpdate, { merge: true });
        await triggerCacheRevalidation('site-content');

    } catch (error) {
        console.error(`Error in updatePromoBanner for ${bannerId}:`, error);
        throw error;
    }
}

export const updateShippingSettings = async (data: Omit<ShippingSettingsData, 'updatedAt'>): Promise<void> => {
    try {
        const updateData = {
            ...data,
            updatedAt: serverTimestamp()
        };
        await setDoc(siteContentRef, { shippingSettings: updateData }, { merge: true });
        await triggerCacheRevalidation('site-content');
    } catch (error) {
        console.error("Error updating shipping settings:", error);
        throw error;
    }
};
