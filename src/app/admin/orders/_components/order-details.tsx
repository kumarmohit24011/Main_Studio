

import type { Order } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface OrderDetailsProps {
    order: Order;
}

export const OrderDetails = ({ order }: OrderDetailsProps) => {
    return (
        <div className="p-4 bg-muted/50 rounded-md">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <ul className="space-y-2">
                        {order.items.map((item: any) => (
                            <li key={item.productId} className='flex justify-between items-center text-sm gap-2'>
                                <Link href={`/admin/products/${item.productId}/edit`} className="flex items-center gap-2 hover:underline">
                                    <span>{item.name} (x{item.quantity})</span>
                                </Link>
                                <span>₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-3"/>
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{(order.totalAmount - (order.shippingCost || 0) + (order.discountAmount || 0)).toFixed(2)}</span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-primary">
                            <span>Discount ({order.couponCode})</span>
                            <span>- ₹{order.discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                     <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>₹{(order.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                     <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Shipping To</h4>
                    <div className="text-sm text-muted-foreground">
                        <p className='font-medium text-foreground'>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                        <p>{order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.phone}</p>
                    </div>
                     <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Payment Details</h4>
                    <div className="text-sm">
                        <p>Payment ID: <span className="font-mono text-xs bg-muted p-1 rounded">{order.razorpayPaymentId}</span></p>
                        <p>Method: Online</p>
                    </div>
                </div>
            </div>
        </div>
    )
}