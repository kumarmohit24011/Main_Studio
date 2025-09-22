
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateShippingSettings, type PlainShippingSettingsData } from '@/services/siteContentService';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const shippingSchema = z.object({
  defaultFee: z.coerce.number().min(0, 'Shipping fee must be a positive number.'),
  freeShippingThreshold: z.coerce.number().min(0, 'Threshold must be a positive number.'),
});

export function ShippingSettingsForm({ settings }: { settings: PlainShippingSettingsData }) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      defaultFee: settings.defaultFee,
      freeShippingThreshold: settings.freeShippingThreshold,
    },
  });

  const onSubmit = async (values: z.infer<typeof shippingSchema>) => {
    try {
      await updateShippingSettings(values);
      toast({ title: 'Success', description: 'Shipping settings updated successfully.' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the settings.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Rate Management</CardTitle>
        <CardDescription>
          Configure your store's shipping fees and rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="defaultFee"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Default Shipping Fee (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 50" {...field} />
                        </FormControl>
                        <FormDescription>This is the standard shipping cost for orders.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="freeShippingThreshold"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Free Shipping Threshold (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 1000" {...field} />
                        </FormControl>
                         <FormDescription>Orders above this amount will have free shipping. Set to 0 to disable.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
