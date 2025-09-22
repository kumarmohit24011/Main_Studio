
'use client';
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { StoredAddress } from "@/lib/types";
import { updateUserProfile } from "@/services/userService";
import { MoreVertical, Trash2, Pencil, Star } from "lucide-react";

interface AddressCardProps {
  address: StoredAddress;
  onEdit: () => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user || !userProfile?.addresses) return;
    try {
      const newAddresses = userProfile.addresses.filter(a => a.id !== address.id);
      await updateUserProfile(user.uid, { addresses: newAddresses });
      toast({ title: "Address Deleted", description: "The address has been removed." });
      refreshUserProfile();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete address." });
    }
  };

  const handleSetDefault = async () => {
    if (!user || !userProfile?.addresses) return;
    try {
      const newAddresses = userProfile.addresses.map(a => ({
        ...a,
        isDefault: a.id === address.id,
      }));
      await updateUserProfile(user.uid, { addresses: newAddresses });
      toast({ title: "Default Address Updated", description: "Your default shipping address has been changed." });
      refreshUserProfile();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update default address." });
    }
  }

  return (
    <div className="text-sm p-3 rounded-md border bg-muted/30 relative flex justify-between items-start">
      <div>
        {address.isDefault && <Badge className="absolute -top-2 -left-2">Default</Badge>}
        <p className="font-semibold">{address.name}</p>
        <p className="text-muted-foreground">{address.street}, {address.city}</p>
        <p className="text-muted-foreground">{address.state}, {address.zipCode}</p>
        <p className="text-muted-foreground">{address.country}</p>
        <p className="text-muted-foreground mt-2">{address.phone}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!address.isDefault && (
            <DropdownMenuItem onClick={handleSetDefault}>
                <Star className="mr-2 h-4 w-4" />
                Set as Default
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Delete
                  </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this address.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
