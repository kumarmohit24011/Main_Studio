
import { db } from '@/lib/firebase';
import type { Order, Product } from '@/lib/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, updateDoc, runTransaction, DocumentReference } from 'firebase/firestore';

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

// This function creates an order in Firestore and updates product stock atomically
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const newOrderId = await runTransaction(db, async (transaction) => {
            // 1. Check stock and get product data
            const productsToUpdate: { ref: DocumentReference, newStock: number }[] = [];
            for (const item of orderData.items) {
                const productRef = doc(db, 'products', item.productId);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${item.productId} not found.`);
                }

                const productData = productDoc.data() as Product;
                if (productData.stock < item.quantity) {
                    throw new Error(`Not enough stock for ${productData.name}. Requested: ${item.quantity}, Available: ${productData.stock}`);
                }

                productsToUpdate.push({
                    ref: productRef,
                    newStock: productData.stock - item.quantity,
                });
            }

            // 2. Create the new order document
            const orderCol = collection(db, 'orders');
            const newOrderRef = doc(orderCol); // Create a new document reference with a unique ID

            const dataToSave: any = {
                ...orderData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            // Clean undefined values
            if (dataToSave.couponCode === undefined) delete dataToSave.couponCode;
            if (dataToSave.discountAmount === undefined) delete dataToSave.discountAmount;

            transaction.set(newOrderRef, dataToSave);

            // 3. Update the stock for each product
            for (const { ref, newStock } of productsToUpdate) {
                transaction.update(ref, { stock: newStock });
            }
            
            return newOrderRef.id; // Return the ID of the newly created order
        });

        // Revalidation is now handled in the hook after this function succeeds
        return newOrderId;

    } catch (error) {
        console.error("Error creating order: ", error);
        // Re-throw the specific error message to be handled by the caller
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
        // No revalidation here either, it should be called from the component that uses this function
    } catch (error) {
        console.error("Error updating order status: ", error);
        throw error;
    }
};
