
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateGiftFinderVisibility } from '@/services/siteContentService';
import { useRouter } from 'next/navigation';

const giftFinderSettingsSchema = z.object({
  showGiftFinder: z.boolean(),
});

export function GiftFinderSettingsForm({ showGiftFinder }: { showGiftFinder: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof giftFinderSettingsSchema>>({
    resolver: zodResolver(giftFinderSettingsSchema),
    defaultValues: {
        showGiftFinder: showGiftFinder,
    },
  });

  const onSubmit = async (values: z.infer<typeof giftFinderSettingsSchema>) => {
    try {
      await updateGiftFinderVisibility(values.showGiftFinder);
      toast({ title: 'Success', description: 'Gift finder visibility updated successfully.' });
      router.refresh(); // Refresh data on the page
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the settings.',
      });
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="showGiftFinder"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Gift Finder Banner</FormLabel>
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    </Form>
  );
}
