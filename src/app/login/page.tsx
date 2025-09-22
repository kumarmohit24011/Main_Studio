
import { Suspense } from 'react';
import LoginClientPage from './_components/login-client-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function LoginPageSkeleton() {
  return (
     <div className="flex items-center justify-center min-h-screen bg-secondary/30 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <Skeleton className="h-7 w-48 mx-auto mb-2" />
            <Skeleton className="h-5 w-64 mx-auto" />
        </CardHeader>
        <CardContent className='space-y-6'>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    ...
                </span>
                </div>
            </div>
            <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl = typeof resolvedSearchParams?.redirect === 'string' ? resolvedSearchParams.redirect : '/';

  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginClientPage redirectUrl={redirectUrl} />
    </Suspense>
  );
}
