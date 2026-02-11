import OrderDetailClient from './OrderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <OrderDetailClient orderId={resolvedParams.id} />;
}
