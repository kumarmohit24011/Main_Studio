'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCustomers } from "@/services/userService";
import { CustomerList } from "./_components/customer-list";
import type { UserProfile } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function CustomersPageSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 border-b pb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminCustomersPage() {
    const { user, userProfile, authLoading } = useAuth();
    const [customers, setCustomers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCustomersData() {
            if (!user || !userProfile?.isAdmin || authLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const customersData = await getAllCustomers();
                setCustomers(customersData);
            } catch (err) {
                console.error('Error fetching customers data:', err);
                setError('Failed to load customers data. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchCustomersData();
    }, [user, userProfile, authLoading]);

    if (authLoading || loading) {
        return <CustomersPageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Customers</CardTitle>
                    <CardDescription>
                        View and manage your customer list.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomerList customers={customers} />
                </CardContent>
            </Card>
        </div>
    );
}