
'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, Search, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { SearchDialog } from "./ui/search-dialog";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import React from "react";
import type { Category } from "@/lib/types";

interface HeaderProps {
    categories: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const wishlistItemCount = wishlist.length;

  const featuredCategories = categories.filter(c => c.isFeatured);

  const renderAuthComponent = () => {
    if (authLoading || !isClient) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (user && userProfile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.photoURL || user.photoURL || undefined} alt={userProfile?.name || user.displayName || 'User'} />
                <AvatarFallback>{userProfile?.name?.[0] || user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
             {userProfile?.isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutUser}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">
            Login
        </Link>
      </Button>
    );
  };
  
  const navLinks = (
    <React.Fragment>
      <Link href="/products" className="hover:text-primary transition-colors" prefetch={true}>All Products</Link>
      {featuredCategories.map(category => (
        <Link 
            key={category.id} 
            href={`/products?category=${category.name}`} 
            className="hover:text-primary transition-colors"
            prefetch={true}
        >
            {category.name}
        </Link>
      ))}
      <Link href="/#contact" className="hover:text-primary transition-colors">Contact</Link>
    </React.Fragment>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-headline font-bold text-primary tracking-wider">
            REDBOW
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks}
            </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:inline-flex">
            <SearchDialog>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </SearchDialog>
          </div>
           <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
              <Link href="/account?tab=wishlist" className="relative" prefetch={true}>
                <Heart className="h-5 w-5" />
                {isClient && wishlistItemCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{wishlistItemCount}</span>}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative" prefetch={true}>
              <ShoppingCart className="h-5 w-5" />
              {isClient && cartItemCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{cartItemCount}</span>}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          <div className="block">
            {renderAuthComponent()}
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm p-0 flex flex-col bg-background">
                <div className="flex justify-between items-center p-4 border-b">
                     <Link href="/" className="text-2xl font-headline font-bold text-primary tracking-wider" onClick={() => setMobileMenuOpen(false)}>
                        REDBOW
                    </Link>
                </div>
                <div className="p-4">
                  <SearchDialog>
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Search products & categories...
                    </Button>
                  </SearchDialog>
                </div>
                <nav className="flex flex-col gap-4 p-4 text-lg">
                    {React.Children.map(navLinks.props.children, child => 
                        child.type === Link ? React.cloneElement(child, { onClick: () => setMobileMenuOpen(false) }) : child
                    )}
                </nav>
                 <div className="mt-auto border-t p-4">
                    {renderAuthComponent()}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
