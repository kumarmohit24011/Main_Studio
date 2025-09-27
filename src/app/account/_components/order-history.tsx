
'use client';

import { useEffect, useState } from 'react';
import { getOrdersByUserId } from '@/services/orderService';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PackageSearch } from "lucide-react";

interface OrderHistoryProps {
    userId: string;
    initialOrders?: Order[];
}

export function OrderHistory({ userId, initialOrders }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [loading, setLoading] = useState(!initialOrders);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialOrders) {
        const fetchOrders = async () => {
          setLoading(true);
          setError(null);
          try {
            const userOrders = await getOrdersByUserId(userId);
            const sortedOrders = userOrders.sort((a, b) => {
              const timeA = a.createdAt?.seconds || 0;
              const timeB = b.createdAt?.seconds || 0;
              return timeB - timeA;
            });
            setOrders(sortedOrders);
          } catch (error) {
            console.error("Failed to load user orders:", error);
            setError("Failed to load your order history. Please try again later.");
          } finally {
            setLoading(false);
          }
        };
        fetchOrders();
    }
  }, [userId, initialOrders]);

  const formatDate = (seconds: number | undefined) => {
    if (!seconds || isNaN(seconds)) {
        return "Date not available";
    }
    return new Date(seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
        <div className="space-y-4">
            <header className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </header>
            <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold">Order History</h2>
                <p className="text-muted-foreground">There was a problem loading your orders.</p>
            </header>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    );
  }
  
  if (orders.length === 0) {
    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold">Order History</h2>
                <p className="text-muted-foreground">Review your past orders and check their fulfillment status.</p>
            </header>
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <PackageSearch className="w-16 h-16 mb-4" />
               <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
               <p>You haven't placed any orders yet. Start shopping to see your order history.</p>
           </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <header>
            <h2 className="text-2xl font-bold">Order History</h2>
            <p className="text-muted-foreground">Review your past orders and check their fulfillment status.</p>
        </header>
        <div className="space-y-6">
            {orders.map((order: Order) => (
                <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row justify-between items-center flex-wrap gap-4 bg-muted/50 p-4 sm:p-6">
                        <div className='grid gap-1'>
                            <p className="text-sm font-medium">Order ID: #{order.id.slice(0, 7)}</p>
                            <p className="text-xs text-muted-foreground">
                                Placed on {formatDate(order.createdAt?.seconds)}
                            </p>
                        </div>
                        <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className='capitalize'>{order.orderStatus}</Badge>
                    </CardHeader>
                    <CardContent className='p-4 sm:p-6'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className='hidden sm:table-cell'>Price</TableHead>
                                    <TableHead className='hidden sm:table-cell'>Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.productId}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className='hidden sm:table-cell'>₹{item.price.toFixed(2)}</TableCell>
                                        <TableCell className='hidden sm:table-cell'>x{item.quantity}</TableCell>
                                        <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-y-4 bg-muted/50 p-4 sm:p-6">
                         <div className="flex justify-between w-full flex-wrap gap-4">
                            <div className="text-sm">
                                <p className="font-semibold mb-1">Shipping Address</p>
                                 <address className="text-muted-foreground not-italic text-xs">
                                    {order.shippingAddress.name}, {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zipCode}
                                 </address>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-base">Total: ₹{order.totalAmount.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </div>
  );
}
