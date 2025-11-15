
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updatePromoBanner, type PromoBannerData } from "@/services/siteContentService";
import Image from 'next/image';

const formSchema = z.object({
  headline: z.string().min(2, { message: "Headline must be at least 2 characters." }),
  subtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
  buttonText: z.string().min(2, { message: "Button text must be at least 2 characters." }),
  buttonLink: z.string().url({ message: "Please enter a valid URL." }),
  image: z.any(),
});

export function PromoBanner1Form({ data }: { data: PromoBannerData }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const { image, ...rest } = values;
        const imageFile = image && image.length > 0 ? image[0] : undefined;
        await updatePromoBanner('promoBanner1', rest, imageFile);
        toast({ title: "Success", description: "Promotional banner 1 updated." });
    } catch (error) {
        console.error("Error updating promo banner 1:", error);
        toast({ title: "Error", description: "Could not update promotional banner 1." });
    }
}


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline</FormLabel>
              <FormControl>
                <Input placeholder="Enter headline" {...field} />
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
                <Input placeholder="Enter subtitle" {...field} />
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
                <Input placeholder="Enter button text" {...field} />
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
                <Input placeholder="Enter button link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex items-center justify-center">
            {data.imageUrl && <Image src={data.imageUrl} alt="Current promo image" width={200} height={200} className="rounded-lg" />}
        </div>

        <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Promotional Image</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  );
}
