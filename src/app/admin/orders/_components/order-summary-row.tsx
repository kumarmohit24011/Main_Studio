
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

type OrderStatus = Order['orderStatus'];

interface OrderSummaryRowProps {
    order: Order;
    onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'delivered': return 'bg-green-500';
        case 'shipped': return 'bg-blue-500';
        case 'processing': return 'bg-yellow-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}

export const OrderSummaryRow = ({ order, onStatusChange }: OrderSummaryRowProps) => {
    return (
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 items-center p-4 text-sm font-normal">
             <div className="font-medium truncate"><span className="font-normal text-muted-foreground">ID:</span> #{order.id.slice(0, 7)}...</div>
            <div className="truncate hidden sm:block"><span className="font-normal text-muted-foreground">Customer:</span> {order.shippingAddress.name}</div>
             <div className="truncate hidden sm:block"><span className="font-normal text-muted-foreground">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</div>
            
            <div className="flex justify-start sm:justify-center">
                 <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className="capitalize text-xs">
                    <span className={cn('h-2 w-2 rounded-full mr-2', getStatusColor(order.orderStatus))}></span>
                    {order.orderStatus}
                </Badge>
            </div>

            <div className="flex justify-end items-center col-start-2 sm:col-start-auto">
                 <span className="font-medium text-base sm:hidden mr-auto">₹{order.totalAmount.toFixed(2)}</span>
                 <span className="hidden sm:inline-block font-medium w-full text-right">₹{order.totalAmount.toFixed(2)}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                             <DropdownMenuItem 
                                key={status} 
                                onClick={() => onStatusChange(order.id, status as OrderStatus)} 
                                className={cn(status === 'cancelled' && 'text-red-600', 'capitalize')}
                            >
                                {status}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}