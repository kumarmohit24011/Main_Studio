
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updatePromoBanner, type PromoBannerData } from '@/services/siteContentService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const bannerSchema = z.object({
  headline: z.string().min(5, 'Headline must be at least 5 characters.'),
  subtitle: z.string().min(10, 'Subtitle must be at least 10 characters.'),
  buttonText: z.string().min(2, 'Button text is required.'),
  buttonLink: z.string().url('Must be a valid URL (e.g., /products).'),
  image: z.any().optional(),
});

interface PromoBannerFormProps {
    bannerId: 'promoBanner1' | 'promoBanner2';
    bannerData: PromoBannerData;
    title: string;
    description: string;
}

export function PromoBannerForm({ bannerId, bannerData, title, description }: PromoBannerFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(bannerData.imageUrl);
  
  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
        headline: bannerData.headline,
        subtitle: bannerData.subtitle,
        buttonText: bannerData.buttonText,
        buttonLink: bannerData.buttonLink,
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

  const onSubmit = async (values: z.infer<typeof bannerSchema>) => {
    try {
      await updatePromoBanner(bannerId, {
        headline: values.headline,
        subtitle: values.subtitle,
        buttonText: values.buttonText,
        buttonLink: values.buttonLink,
      }, values.image);

      toast({ title: 'Success', description: `${title} updated successfully.` });
      router.refresh(); 
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `An error occurred while saving the ${title.toLowerCase()}.`,
      });
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
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
                                        <Input placeholder="Festive Discounts" {...field} />
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
                                        <Input placeholder="Up to 30% off..." {...field} />
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
                                        <Input placeholder="/products?category=Necklaces" {...field} />
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
                                    <Image src={preview} alt="Banner image preview" fill sizes="100vw" className="object-cover" />
                                </div>
                            )}
                            <Input type="file" accept="image/*" onChange={onFileChange} />
                            <p className="text-sm text-muted-foreground">Recommended size: 600x400 pixels.</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
