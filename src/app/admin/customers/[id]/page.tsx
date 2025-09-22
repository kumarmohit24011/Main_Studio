import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./_components/customer-detail-client";

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    
    if (!id) {
        notFound();
    }

    return <CustomerDetailClient customerId={id} />;
}