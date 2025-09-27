
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { shippingSchema } from '@/lib/schemas';
import { updateUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MapPin, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { StoredAddress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ShippingFormProps {
    onFormSubmit: (data: z.infer<typeof shippingSchema> | null) => void;
}

const newAddressSchema = shippingSchema.extend({
  saveAddress: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export function ShippingForm({ onFormSubmit }: ShippingFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const form = useForm<z.infer<typeof newAddressSchema>>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      name:  '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      phone: '',
      saveAddress: true,
      isDefault: false,
    },
  });

  useEffect(() => {
    const addresses: StoredAddress[] = userProfile?.addresses || [];
    if (addresses.length > 0 && !showNewAddressForm) {
      const defaultAddress = addresses.find((addr: StoredAddress) => addr.isDefault) || addresses[0];
      if(defaultAddress && !selectedAddressId) {
        handleAddressSelection(defaultAddress.id);
      }
    } else if (addresses.length === 0) {
        setShowNewAddressForm(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.addresses, showNewAddressForm]); 

  const handleAddressSelection = (addressId: string) => {
    setShowNewAddressForm(false);
    setSelectedAddressId(addressId);
    const selected = userProfile?.addresses?.find((addr: StoredAddress) => addr.id === addressId);
    if(selected) {
        form.reset({ ...selected, saveAddress: false, isDefault: false });
        onFormSubmit(selected);
    }
  }

  const handleAddNewClick = () => {
    setShowNewAddressForm(true);
    setSelectedAddressId(null);
    onFormSubmit(null);
    form.reset({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        street: '', city: '', state: '', zipCode: '', country: 'India',
        saveAddress: true, isDefault: userProfile?.addresses?.length === 0,
    });
  }

  const onSubmit = async (data: z.infer<typeof newAddressSchema>) => {
    onFormSubmit(data);
    
    if (user && data.saveAddress) {
        try {
            const newAddress: StoredAddress = {
                id: `addr_${Date.now()}`,
                name: data.name,
                street: data.street,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
                phone: data.phone,
                isDefault: (userProfile?.addresses?.length || 0) === 0 || data.isDefault,
            };
            
            const existingAddresses = userProfile?.addresses || [];
            
            const addressExists = existingAddresses.some(addr => 
                addr.street.toLowerCase() === newAddress.street.toLowerCase() &&
                addr.city.toLowerCase() === newAddress.city.toLowerCase() &&
                addr.zipCode === newAddress.zipCode &&
                addr.name.toLowerCase() === newAddress.name.toLowerCase()
            );

            if (addressExists) {
                toast({
                    title: "Address Already Saved",
                    description: "This address is already in your address book.",
                });
                return;
            }

            let finalAddresses = [...existingAddresses];
            if (newAddress.isDefault) {
                finalAddresses = finalAddresses.map(addr => ({ ...addr, isDefault: false }));
            }
            finalAddresses.push(newAddress);

            await updateUserProfile(user.uid, { addresses: finalAddresses });
            
             toast({
                title: "Address Saved",
                description: "Your new shipping address has been saved.",
            });

        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
             toast({
                variant: 'destructive',
                title: "Save Failed",
                description: `Could not save your new shipping address: ${errorMessage}`,
            });
        }
    } else {
         toast({
            title: "Address Confirmed",
            description: "Your shipping address is set for this order.",
            action: <CheckCircle className='text-green-500' />
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3">
            <FormLabel>Saved Addresses</FormLabel>
            {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {userProfile.addresses.map((addr: StoredAddress) => (
                         <Card 
                            key={addr.id} 
                            onClick={() => handleAddressSelection(addr.id)}
                            className={cn(
                                "p-4 rounded-lg cursor-pointer border-2 transition-colors relative",
                                selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                         >
                            {selectedAddressId === addr.id && <Badge variant="default" className="absolute -top-2 -left-2">Selected</Badge>}
                            {addr.isDefault && <Badge className="absolute -top-2 -right-2">Default</Badge>}
                            <p className="font-semibold">{addr.name}</p>
                            <p className="text-muted-foreground text-sm mt-1">{addr.street}, {addr.city}</p>
                            <p className="text-muted-foreground text-sm">{addr.state}, {addr.zipCode}</p>
                            <p className="text-muted-foreground text-sm mt-2">{addr.phone}</p>
                         </Card>
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        className="w-full h-full min-h-[120px] items-center justify-center flex-col gap-2 border-dashed"
                        onClick={handleAddNewClick}
                        >
                        <Plus className="h-6 w-6" />
                        <span>Add a new address</span>
                    </Button>
                </div>
            ) : (
                showNewAddressForm ? null : (
                    <div className="text-center py-8 text-muted-foreground text-sm rounded-lg border border-dashed">
                        <MapPin className="mx-auto h-8 w-8 mb-2" />
                        <p>You have no saved addresses yet.</p>
                        <Button type='button' variant='link' onClick={handleAddNewClick}>Add one to get started</Button>
                    </div>
                )
            )}
        </div>

        {showNewAddressForm && (
            <div className='space-y-4 pt-4 border-t'>
                 <h3 className="text-lg font-semibold">New Address Details</h3>
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input placeholder="Mumbai" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                            <Input placeholder="Maharashtra" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                                <Input placeholder="400001" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input disabled {...field} value="India" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="For shipping updates" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {user && (
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name="saveAddress"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Save this address</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch('saveAddress') && (
                            <FormField
                                control={form.control}
                                name="isDefault"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Make this my default address</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={!form.getValues('saveAddress')}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                )}
                 <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                     {form.formState.isSubmitting ? "Saving..." : "Use this Address"}
                </Button>
            </div>
        )}
      </form>
    </Form>
  );
}
