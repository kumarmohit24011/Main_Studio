'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OrderHistory } from "@/app/account/_components/order-history";
import { Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrdersByUserId } from "@/services/orderService";
import { useAuth } from "@/hooks/use-auth";
import type { Order, StoredAddress, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";

const toPlainObject = (data: any) => {
    if (data?.createdAt?.seconds) {
        data.createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
    }
    if (data?.updatedAt?.seconds) {
        data.updatedAt = new Date(data.updatedAt.seconds * 1000).toISOString();
    }
    return data;
};

interface CustomerDetailClientProps {
    customerId: string;
}

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
    const { userProfile, authLoading } = useAuth();
    const router = useRouter();
    const [customerProfile, setCustomerProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect non-admin users
        if (!authLoading && (!userProfile || !userProfile.isAdmin)) {
            router.push('/');
            return;
        }

        // Only proceed if user is authenticated and is admin
        if (!authLoading && userProfile?.isAdmin) {
            loadCustomerData();
        }
    }, [authLoading, userProfile, customerId, router]);

    const loadCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load customer profile
            const profile = await getUserProfile(customerId);
            if (!profile) {
                setError("Customer not found");
                return;
            }
            setCustomerProfile(profile);

            // Load customer orders
            try {
                const ordersData = await getOrdersByUserId(profile.uid);
                const plainOrders = ordersData.map(toPlainObject);
                setOrders(plainOrders);
            } catch (orderError) {
                console.error("Failed to load orders for customer:", orderError);
                // Orders will remain empty array, which will show "No orders" message
                setOrders([]);
            }
        } catch (err) {
            console.error("Error loading customer data:", err);
            setError(err instanceof Error ? err.message : "Failed to load customer data");
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Redirect if not admin (this shouldn't render due to useEffect redirect)
    if (!userProfile?.isAdmin) {
        return null;
    }

    // Show loading while fetching customer data
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading customer details...</span>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadCustomerData} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    // Show not found state
    if (!customerProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <h2 className="text-lg font-semibold mb-2">Customer Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The customer with ID {customerId} could not be found.
                </p>
                <Button asChild variant="outline">
                    <Link href="/admin/customers">Back to Customers</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* User Header */}
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={customerProfile.photoURL} />
                    <AvatarFallback>{customerProfile.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{customerProfile.name}</h1>
                    <p className="text-muted-foreground">{customerProfile.email}</p>
                    {customerProfile.isAdmin && (
                        <Badge variant="destructive" className="mt-2">
                            Admin
                        </Badge>
                    )}
                </div>
                <Button asChild className="ml-auto">
                    <Link href={`/admin/orders?customerId=${customerProfile.uid}`}>
                        View All Orders
                    </Link>
                </Button>
            </div>

            {/* Orders + Addresses */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <OrderHistory userId={customerProfile.uid} initialOrders={orders} />
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Addresses</CardTitle>
                            <CardDescription>
                                Customer&apos;s saved shipping addresses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {customerProfile.addresses && customerProfile.addresses.length > 0 ? (
                                customerProfile.addresses.map((addr: StoredAddress) => (
                                    <div
                                        key={addr.id}
                                        className="text-sm p-3 rounded-md border bg-muted/30 relative"
                                    >
                                        {addr.isDefault && (
                                            <Badge className="absolute -top-2 -right-2">Default</Badge>
                                        )}
                                        <p className="font-semibold">{addr.name}</p>
                                        <p className="text-muted-foreground">
                                            {addr.street}, {addr.city}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {addr.state}, {addr.zipCode}
                                        </p>
                                        <p className="text-muted-foreground">{addr.country}</p>
                                        <p className="text-muted-foreground mt-2">{addr.phone}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <Home className="mx-auto h-8 w-8 mb-2" />
                                    <p>No saved addresses.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}