
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
import { PlusCircle, MoreHorizontal, Trash2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Coupon } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';


const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(4, 'Coupon code must be at least 4 characters.').toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0, 'Discount value must be positive.'),
  isActive: z.boolean(),
});

export function CouponActions({ coupons }: { coupons: Coupon[] }) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discountType: 'fixed',
      discountValue: 0,
      isActive: true,
    },
  });

  const handleDialogOpen = (coupon: Coupon | null = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      form.reset({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isActive: coupon.isActive,
      });
    } else {
      form.reset({ code: '', discountType: 'fixed', discountValue: 0, isActive: true });
    }
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
        await deleteCoupon(id);
        toast({ title: "Success", description: "Coupon deleted successfully." });
        router.refresh(); 
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete coupon." });
    }
  }

   const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast({ title: "Success", description: `Coupon ${coupon.code} has been ${!coupon.isActive ? 'activated' : 'deactivated'}.` });
      router.refresh();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update coupon status." });
    }
  };

  const onSubmit = async (values: z.infer<typeof couponSchema>) => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, values);
        toast({ title: 'Success', description: 'Coupon updated successfully.' });
      } else {
        await addCoupon(values);
        toast({ title: 'Success', description: 'Coupon added successfully.' });
      }
      setDialogOpen(false);
      setEditingCoupon(null);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'A coupon with this code may already exist.',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1" onClick={() => handleDialogOpen()}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Coupon</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update the details for this coupon.' : 'Fill in the details for the new coupon.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SUMMER20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a discount type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 100 or 15" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                         <p className="text-sm text-muted-foreground">
                            Inactive coupons cannot be used by customers.
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
                        {form.formState.isSubmitting ? "Saving..." : "Save Coupon"}
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-medium">{coupon.code}</TableCell>
              <TableCell className="capitalize">{coupon.discountType}</TableCell>
              <TableCell>{coupon.discountType === 'fixed' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}</TableCell>
               <TableCell>
                    <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                    <DropdownMenuItem onClick={() => handleDialogOpen(coupon)}>
                        <Pencil className="mr-2 h-4 w-4"/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(coupon)}>
                        {coupon.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
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
                                This action cannot be undone. This will permanently delete the coupon.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(coupon.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {coupons.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No coupons found. Get started by adding a new one.</p>
          </div>
        )}
    </div>
  );
}
