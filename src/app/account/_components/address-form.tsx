
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { shippingSchema } from '@/lib/schemas';
import type { StoredAddress } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { updateUserProfile } from '@/services/userService';

const addressFormSchema = shippingSchema;

interface AddressFormProps {
  address?: StoredAddress | null;
  onSuccess: () => void;
}

export function AddressForm({ address, onSuccess }: AddressFormProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: address?.name || userProfile?.name || '',
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      country: 'India',
      phone: address?.phone || userProfile?.phone || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof addressFormSchema>) => {
    if (!user || !userProfile) return;

    try {
      const currentAddresses = userProfile.addresses || [];
      let newAddresses: StoredAddress[];

      if (address) {
        // Editing an existing address
        newAddresses = currentAddresses.map((a) =>
          a.id === address.id ? { ...a, ...data } : a
        );
      } else {
        // Adding a new address
        const newAddress: StoredAddress = {
          ...data,
          id: `addr_${Date.now()}`,
          isDefault: currentAddresses.length === 0, // Make first address default
        };
        newAddresses = [...currentAddresses, newAddress];
      }

      await updateUserProfile(user.uid, { addresses: newAddresses });
      toast({
        title: "Success",
        description: `Address has been successfully ${address ? 'updated' : 'added'}.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save address. Please try again.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
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
                  <Input disabled {...field} />
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
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Address"}
        </Button>
      </form>
    </Form>
  );
}
