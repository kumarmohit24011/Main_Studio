'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllOrders, getOrdersByUserId } from "@/services/orderService";
import { OrderActions } from "./_components/order-actions";
import type { Order } from "@/lib/types";
import { getUserProfile } from "@/services/userService";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function OrdersPageSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="border rounded p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminOrdersPage() {
    const { user, userProfile, authLoading } = useAuth();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrdersData() {
            if (!user || !userProfile?.isAdmin || authLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                let ordersData: Order[];
                let customerData = null;

                if (customerId) {
                    [ordersData, customerData] = await Promise.all([
                        getOrdersByUserId(customerId),
                        getUserProfile(customerId)
                    ]);
                } else {
                    ordersData = await getAllOrders();
                }

                setOrders(ordersData);
                setCustomer(customerData);
            } catch (err) {
                console.error('Error fetching orders data:', err);
                setError('Failed to load orders data. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchOrdersData();
    }, [user, userProfile, authLoading, customerId]);

    if (authLoading || loading) {
        return <OrdersPageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                            <Button 
                                onClick={() => window.location.reload()} 
                                className="mt-4"
                                variant="outline"
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const title = customerId && customer ? `Orders for ${customer.name}` : "Manage Orders";
    const description = customerId
        ? `Viewing all orders placed by ${customer?.email}`
        : "View and process customer orders. Filter by status using the tabs below.";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderActions orders={orders} />
                </CardContent>
            </Card>
        </div>
    );
}