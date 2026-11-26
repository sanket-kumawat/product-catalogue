import { CategoryListResponseSchema } from '@product-catalogue/shared';
import { queryOptions } from '@tanstack/react-query';

import { apiGet } from '@/shared/api/client';

export function categoryListQuery() {
  return queryOptions({
    queryKey: ['categories'],
    queryFn: async () =>
      CategoryListResponseSchema.parse(await apiGet('/categories')),
  });
}
