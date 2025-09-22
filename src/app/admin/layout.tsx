
'use client';

import Link from 'next/link';
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Settings,
  LayoutGrid, // Added category icon
  Tag, // Coupon Icon
  Presentation, // Hero Icon
  Megaphone, // Promotions Icon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, authLoading, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (userProfile && !userProfile.isAdmin) {
        router.push('/?error=unauthorized');
      }
    }
  }, [user, userProfile, authLoading, router]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
             <div className="w-full flex-1">
                <Skeleton className="h-8 w-1/2" />
            </div>
             <Skeleton className="h-8 w-8 rounded-full" />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
             <Skeleton className="h-full w-full" />
          </main>
        </div>
      </div>
    );
  }

  // Handle the case where user is loaded but profile is still loading
  if (!userProfile && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized users
  if (userProfile && !userProfile.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have permission to access the admin panel.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  const isActive = (path: string) => pathname === path;

  const navLinks = (
      <>
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/orders') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Orders
          <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            6
          </Badge>
        </Link>
        <Link
          href="/admin/products"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/products') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Package className="h-4 w-4" />
          Products{' '}
        </Link>
         <Link
          href="/admin/categories"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/categories') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <LayoutGrid className="h-4 w-4" />
          Categories{' '}
        </Link>
        <Link
          href="/admin/coupons"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/coupons') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Tag className="h-4 w-4" />
          Coupons{' '}
        </Link>
        <Link
          href="/admin/customers"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/customers') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Users className="h-4 w-4" />
          Customers
        </Link>
         <Link
          href="/admin/hero"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/hero') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Presentation className="h-4 w-4" />
          Hero Section
        </Link>
        <Link
          href="/admin/promotions"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/promotions') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Megaphone className="h-4 w-4" />
          Promotions
        </Link>
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive('/admin/settings') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">Redbow Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package2 className="h-6 w-6 text-primary" />
                  <span className="font-headline">Redbow Admin</span>
                </Link>
                {navLinks}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL || ''} />
                        <AvatarFallback>{userProfile?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/account">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/">Back to Site</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOutUser}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
        </main>
      </div>
    </div>
  );
}
