import { z } from 'zod';

export const EnquiryBodySchema = z.strictObject({
  productId: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(200).pipe(z.email()),
  phone: z.string().trim().min(1).max(30).optional(),
  message: z.string().trim().min(1).max(1000),
});

export type EnquiryBody = z.infer<typeof EnquiryBodySchema>;

export const EnquirySuccessResponseSchema = z.strictObject({
  message: z.literal('Thank you'),
});

export type EnquirySuccessResponse = z.infer<typeof EnquirySuccessResponseSchema>;
