import { createFileRoute } from '@tanstack/react-router';

import { CategoryPage } from '@/pages/category';

export const Route = createFileRoute('/categories/$slug')({
  component: CategoryRoute,
});

function CategoryRoute() {
  const { slug } = Route.useParams();
  return <CategoryPage slug={slug} />;
}
