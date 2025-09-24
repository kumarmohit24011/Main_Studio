
'use client';

import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface CustomerListProps {
    customers: UserProfile[];
}

export function CustomerList({ customers }: CustomerListProps) {
    return (
        <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.uid}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={customer.photoURL} alt={customer.name} />
                                        <AvatarFallback>{customer.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium truncate">{customer.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell truncate">{customer.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                {customer.isAdmin ? (
                                    <Badge variant="destructive">Admin</Badge>
                                ) : (
                                    <Badge variant="outline">Customer</Badge>
                                )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {new Date(customer.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/customers/${customer.uid}`}>View Details</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/orders?customerId=${customer.uid}`}>View Orders</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {customers.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <p>No customers found.</p>
                </div>
            )}
        </div>
    );
}
