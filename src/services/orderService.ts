
import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { triggerCacheRevalidation } from '@/lib/cache-client';
import { updateProductStock } from './productService';

const toPlainObject = (order: any): Order => {
    if (!order) return order;
    const plain = { ...order };
    if (order.createdAt?.seconds) {
        plain.createdAt = new Date(order.createdAt.seconds * 1000).toISOString();
    }
    if (order.updatedAt?.seconds) {
        plain.updatedAt = new Date(order.updatedAt.seconds * 1000).toISOString();
    }
    return plain;
};

// This function creates an order in Firestore and updates product stock
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const batch = writeBatch(db);

    try {
        // 1. Create a new order document
        const orderCol = collection(db, 'orders');
        const newOrderRef = doc(orderCol); // Create a new document reference with a unique ID
        
        const dataToSave: any = {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Firestore does not allow `undefined` values.
        if (dataToSave.couponCode === undefined) {
            delete dataToSave.couponCode;
        }
        if (dataToSave.discountAmount === undefined) {
            delete dataToSave.discountAmount;
        }

        batch.set(newOrderRef, dataToSave);

        // 2. Update the stock for each product in the order
        for (const item of orderData.items) {
            const productRef = doc(db, 'products', item.productId);
            batch.update(productRef, { 
                stock: -item.quantity, // Decrement stock
            });
        }

        // 3. Commit the batch write
        await batch.commit();

        // 4. Revalidate cache after successful order creation
        await triggerCacheRevalidation('orders');
        orderData.items.forEach(item => {
            triggerCacheRevalidation('products', `/products/${item.productId}`);
        });

    } catch (error) {
        console.error("Error creating order: ", error);
        // The batch is atomic, so no need to manually rollback.
        throw error;
    }
};

// This function retrieves all orders for a specific user
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        // Fetch orders by user ID and sort by creation date descending
        const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error fetching orders for user: ", error);
        throw new Error(`Failed to fetch orders for user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// This function retrieves all orders for the admin panel
export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => toPlainObject({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all orders: ", error);
        throw new Error(`Failed to fetch all orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// This function updates the status of an order
export const updateOrderStatus = async (orderId: string, status: Order['orderStatus']): Promise<void> => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            orderStatus: status,
            updatedAt: serverTimestamp()
        });
        await triggerCacheRevalidation('orders');
    } catch (error) {
        console.error("Error updating order status: ", error);
        throw error;
    }
};
