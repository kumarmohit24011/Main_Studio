
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Trash2, Pencil, Grip, Upload, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Category } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addCategory, updateCategory, deleteCategory, updateCategoryOrder } from '@/services/categoryService';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Category name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
  image: z.instanceof(File).optional(),
});

export function CategoryActions({ categories: initialCategories }: { categories: Category[] }) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      isFeatured: false,
    },
  });

  const handleDialogOpen = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl || '',
        isFeatured: category.isFeatured || false,
      });
      setPreview(category.imageUrl || '');
    } else {
      form.reset({ name: '', description: '', imageUrl: '', isFeatured: false });
      setPreview('');
    }
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
        await deleteCategory(id);
        toast({ title: "Success", description: "Category deleted successfully." });
        // Wait a bit for cache revalidation to complete, then refresh
        setTimeout(() => {
          router.refresh();
        }, 100);
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete category." });
    }
  }

  const handleToggleFeatured = async (category: Category) => {
    try {
      await updateCategory(category.id, { isFeatured: !category.isFeatured });
      toast({ title: "Success", description: `Category "${category.name}" has been ${!category.isFeatured ? 'featured' : 'unfeatured'}.` });
      // Wait a bit for cache revalidation to complete, then refresh
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update category status." });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    form.setValue('image', undefined);
    form.setValue('imageUrl', '');
    setPreview('');
  };

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      const { image, ...categoryData } = values;
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData, image);
        toast({ title: 'Success', description: 'Category updated successfully.' });
      } else {
        const newCategory = { ...categoryData, order: categories.length };
        await addCategory(newCategory, image);
        toast({ title: 'Success', description: 'Category added successfully.' });
      }
      setDialogOpen(false);
      setEditingCategory(null);
      setPreview('');
      // Wait a bit for cache revalidation to complete, then refresh
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving the category.',
      });
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategories(items);

    const updatedOrder = items.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    try {
      await updateCategoryOrder(updatedOrder);
      toast({ title: "Order Updated", description: "Category order saved successfully." });
      // Wait a bit for cache revalidation to complete, then refresh
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save category order." });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1" onClick={() => handleDialogOpen()}>
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Category</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the details for this category.' : 'Fill in the details for the new category.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Necklaces" {...field} />
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
                        <Textarea placeholder="A short description of the category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {preview && (
                            <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                              <Image src={preview} alt="Category preview" fill sizes="128px" className="object-cover"/>
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={handleRemoveImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="relative w-full border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Upload category image</p>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={onFileChange} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Feature in Header</FormLabel>
                         <p className="text-sm text-muted-foreground">
                            Show this category in the main site navigation.
                        </p>
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Category"}
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories-table">
          {(provided) => (
            <Table {...provided.droppableProps} ref={provided.innerRef}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id} index={index}>
                    {(provided) => (
                      <TableRow ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <TableCell>
                          <Grip className="h-5 w-5 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Switch
                              checked={category.isFeatured}
                              onCheckedChange={() => handleToggleFeatured(category)}
                              aria-label="Toggle featured status"
                            />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleDialogOpen(category)}>
                                  <Pencil className="mr-2 h-4 w-4"/>
                                  Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash2 className="mr-2 h-4 w-4 text-red-500"/>
                                          <span className="text-red-500">Delete</span>
                                      </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the
                                          category.
                                      </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            </Table>
          )}
        </Droppable>
      </DragDropContext>
       {categories.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No categories found. Get started by adding a new one.</p>
          </div>
        )}
    </div>
  );
}
