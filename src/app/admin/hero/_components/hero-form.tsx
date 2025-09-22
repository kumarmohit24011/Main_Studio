
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateHeroSection, type HeroSectionData } from '@/services/siteContentService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

const heroSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters.'),
  subtitle: z.string().min(10, 'Subtitle must be at least 10 characters.'),
  buttonText: z.string().min(2, 'Button text is required.'),
  buttonLink: z.string().url('Must be a valid URL (e.g., /products).'),
  image: z.any().optional(),
});

type PlainHeroData = Omit<HeroSectionData, 'updatedAt'> & { updatedAt?: string };

export function HeroForm({ heroData }: { heroData: PlainHeroData }) {
  const { toast } = useToast();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(heroData.imageUrl);
  
  const form = useForm<z.infer<typeof heroSchema>>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
        headline: heroData.headline,
        subtitle: heroData.subtitle,
        buttonText: heroData.buttonText,
        buttonLink: heroData.buttonLink,
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      form.setValue('image', file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const onSubmit = async (values: z.infer<typeof heroSchema>) => {
    try {
      await updateHeroSection({
        headline: values.headline,
        subtitle: values.subtitle,
        buttonText: values.buttonText,
        buttonLink: values.buttonLink,
      }, values.image);

      toast({ title: 'Success', description: 'Hero section updated successfully.' });
      router.refresh(); // Refresh data on the page
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the hero section.',
      });
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="headline"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                                <Input placeholder="Timeless Elegance, Redefined" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                                <Input placeholder="Discover our exclusive collection..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="buttonText"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                                <Input placeholder="Shop Now" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="buttonLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                                <Input placeholder="/products" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-2">
                     <FormLabel>Background Image</FormLabel>
                    {preview && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                            <Image src={preview} alt="Hero image preview" fill sizes="100vw" className="object-cover" />
                        </div>
                    )}
                     <Input type="file" accept="image/*" onChange={onFileChange} />
                     <p className="text-sm text-muted-foreground">Recommended size: 1800x1000 pixels.</p>
                </div>
             </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    </Form>
  );
}
