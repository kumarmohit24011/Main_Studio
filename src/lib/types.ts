
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    categories: string[];
    sku?: string;
    imageUrl?: string; 
    imageUrls?: string[];
    stock: number;
    tags?: string[];
    isPublished: boolean; 
    isNewArrival?: boolean;
    featured?: boolean;
    createdAt?: any | string;
    updatedAt?: any | string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl?: string; 
    isFeatured?: boolean;
    order?: number;
    productCount?: number;
    createdAt: any | string; 
}

export interface CartItem { 
    productId: string; 
    quantity: number; 
    name?: string;
    price?: number;
    imageUrl?: string;
    stock?: number;
}

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    addresses?: StoredAddress[];
    photoURL?: string;
    isAdmin?: boolean;
    createdAt: any; 
    wishlist: string[];
    cart: CartItem[];
}


export interface StoredAddress {
    id: string; 
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface ShippingAddress {
      name: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
}

export interface Order {
    id: string;
    userId: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'paid' | 'pending';
    shippingAddress: ShippingAddress;
    shippingCost?: number;
    razorpayPaymentId?: string;
    couponCode?: string;
    discountAmount?: number;
    createdAt: any; 
    updatedAt: any; 
}

export interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
    minimumSpend?: number;
    createdAt: any; 
}
