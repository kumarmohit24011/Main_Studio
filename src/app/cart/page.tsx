
'use client';

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartLoading } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  if (cartLoading) {
    return (
       <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-2xl md:text-3xl font-headline font-bold mb-6 md:mb-8">Your Cart</h1>
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                           <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-20 w-20 md:h-24 md:w-24 text-muted-foreground" />
        <h1 className="mt-6 text-2xl md:text-3xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-headline font-bold mb-6 md:mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Cart Items ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.productId} className="py-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 sm:col-span-2">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "https://picsum.photos/100/100"}
                        alt={item.name || "Product image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 120px"
                      />
                    </div>
                  </div>
                  <div className="col-span-9 sm:col-span-10 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <h3 className="font-semibold truncate text-base">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">₹{item.price?.toFixed(2)}</p>
                    </div>
                    <div className="col-span-8 sm:col-span-4 flex items-center gap-1">
                       <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                           <Minus className="h-4 w-4" />
                       </Button>
                       <span className="w-10 text-center font-medium">{item.quantity}</span>
                       <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                           <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                    <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                      <p className="font-semibold text-right text-base">
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.productId)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
