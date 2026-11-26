import {
  EnquirySuccessResponseSchema,
  type EnquiryBody,
} from '@product-catalogue/shared';
import { useMutation } from '@tanstack/react-query';

import { apiPost } from '@/shared/api/client';

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: async (body: EnquiryBody) =>
      EnquirySuccessResponseSchema.parse(await apiPost('/enquiries', body)),
  });
}
