import { SearchQuerySchema } from '@product-catalogue/shared';
import { createFileRoute } from '@tanstack/react-router';

import { SearchPage } from '@/pages/search';

export const Route = createFileRoute('/search')({
  validateSearch: SearchQuerySchema,
  component: SearchRoute,
});

function SearchRoute() {
  const { q } = Route.useSearch();
  return <SearchPage query={q} />;
}
