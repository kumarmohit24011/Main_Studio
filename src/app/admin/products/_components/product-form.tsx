

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import { addProduct, updateProduct } from '@/services/productService';
import { Badge } from '@/components/ui/badge';
import { X, CloudUpload, TrendingUp, Sparkles, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  images: z.array(z.any()).optional(), // For new file uploads
});

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>(product?.imageUrls || []);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category || '',
      sku: product?.sku || '',
      tags: product?.tags || [],
      isNewArrival: product?.isNewArrival || false,
      isTrending: product?.tags?.includes('popular') || false,
      isPublished: product?.isPublished ?? true,
      images: [],
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const currentFiles = form.getValues('images') || [];
        form.setValue('images', [...currentFiles, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const handleRemovePreview = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    const existingImagesCount = product?.imageUrls?.length || 0;
    if (index >= existingImagesCount) {
        const newImages = [...(form.getValues('images') || [])];
        newImages.splice(index - existingImagesCount, 1);
        form.setValue('images', newImages);
    } 
    toast({ title: "Image marked for removal", description: "Save the product to confirm changes."});
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!form.getValues('tags')?.includes(newTag)) {
        form.setValue('tags', [...(form.getValues('tags') || []), newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', form.getValues('tags')?.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      // Handle special tags from toggles
      let finalTags = values.tags?.filter(tag => tag !== 'new' && tag !== 'popular') || [];
      if (values.isTrending) {
        finalTags.push('popular');
      }
      
      const productData = { ...values, tags: finalTags };
      
      if (product) {
        const existingImageUrls = previews.filter(p => p.startsWith('http'));
        await updateProduct(product.id, { ...productData, existingImageUrls }, values.images);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        if (!values.images || values.images.length === 0) {
            form.setError('images', { type: 'manual', message: 'At least one product image is required.' });
            return;
        }
        await addProduct(productData, values.images);
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the product.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Basic information about the product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Elegant Diamond Ring" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="A detailed description of the product..." {...field} rows={5}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 1200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 10" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. RDBW-001" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category for the product" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((cat: Category) => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Custom Tags</FormLabel>
                                <FormControl>
                                <div>
                                    <Input 
                                        placeholder="Add tags (press Enter or comma)" 
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        disabled={field.value?.includes('new') || field.value?.includes('popular')}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {field.value?.filter(tag => tag !== 'new' && tag !== 'popular').map(tag => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                </FormControl>
                                <FormDescription>Tags help with searching and filtering (e.g. `sale`, `gift`).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
          </div>
          
          {/* Sidebar Column */}
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2"><Eye className="h-4 w-4 text-green-500" /> Published</FormLabel>
                                <FormDescription>Make this product visible to customers.</FormDescription>
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
                    <FormField
                        control={form.control}
                        name="isNewArrival"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" /> New Arrival</FormLabel>
                                <FormDescription>Show in the "New Arrivals" section.</FormDescription>
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
                     <FormField
                        control={form.control}
                        name="isTrending"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" /> Trending</FormLabel>
                                 <FormDescription>Show in the "Trending Products" section.</FormDescription>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="images"
                        render={() => (
                            <FormItem>
                                <FormLabel>Upload Images</FormLabel>
                                <FormControl>
                                    <div className="relative w-full border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                                        <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                                        <Input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={onFileChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {previews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {previews.map((src, index) => (
                                <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                                    <Image src={src} alt={`Preview ${index + 1}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover"/>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleRemovePreview(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {index === 0 && <Badge className="absolute bottom-1 left-1">Cover</Badge>}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

          </div>
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
          {form.formState.isSubmitting ? "Saving..." : (product ? "Update Product" : "Add Product")}
        </Button>
      </form>
    </Form>
  );
}
