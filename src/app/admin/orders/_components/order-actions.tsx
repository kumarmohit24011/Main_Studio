
'use client';

import { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/services/orderService';
import { OrderDetails } from './order-details';
import { OrderSummaryRow } from './order-summary-row';
import { OrderTableHeader } from './order-table-header';
import { ChevronDown } from 'lucide-react';

type OrderStatus = Order['orderStatus'];

export function OrderActions({ orders }: { orders: Order[] }) {
    const { toast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            toast({ title: "Success", description: `Order status updated to ${status}.` });
            router.refresh(); // Refresh data on the page
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update order status." });
        }
    }
        
    const filteredOrders = useMemo(() => {
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (activeTab === 'all') {
            return sortedOrders;
        }
        return sortedOrders.filter((order: Order) => order.orderStatus === activeTab);
    }, [orders, activeTab]);

  return (
    <div className="space-y-4">
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as OrderStatus | 'all')} className="w-full">
            <div className="overflow-x-auto">
                 <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                    <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
                    <TabsTrigger value="processing" className="whitespace-nowrap">Processing</TabsTrigger>
                    <TabsTrigger value="shipped" className="whitespace-nowrap">Shipped</TabsTrigger>
                    <TabsTrigger value="delivered" className="whitespace-nowrap">Delivered</TabsTrigger>
                    <TabsTrigger value="cancelled" className="whitespace-nowrap">Cancelled</TabsTrigger>
                </TabsList>
            </div>
        </Tabs>

        <div className="border rounded-lg">
            <OrderTableHeader />
            <Accordion type="single" collapsible className="w-full">
                {filteredOrders.map((order: Order) => (
                    <AccordionItem value={order.id} key={order.id}>
                        <div className="flex items-center w-full hover:bg-muted/50 rounded-t-lg">
                            <OrderSummaryRow order={order} onStatusChange={handleStatusChange} />
                            <AccordionTrigger className="p-4">
                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            </AccordionTrigger>
                        </div>
                        <AccordionContent>
                            <OrderDetails order={order}/>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

        {filteredOrders.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                <p>No orders found for this status.</p>
            </div>
        )}
    </div>
  );
}
