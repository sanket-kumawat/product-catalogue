import { createFileRoute } from '@tanstack/react-router';

import { ProductDetailPage } from '@/pages/product-detail';

export const Route = createFileRoute('/products/$productId')({
  component: ProductRoute,
});

function ProductRoute() {
  const { productId } = Route.useParams();
  return <ProductDetailPage productId={productId} />;
}
