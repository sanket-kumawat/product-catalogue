import { describe, expect, it } from 'vitest';

import { EnquiryBodySchema } from './enquiry.js';

const enquiry = {
  productId: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I would like to know the lead time.',
};

describe('EnquiryBodySchema', () => {
  it('accepts a message of 1000 characters', () => {
    const parsed = EnquiryBodySchema.parse({
      ...enquiry,
      message: 'a'.repeat(1000),
    });

    expect(parsed.message).toHaveLength(1000);
  });

  it('rejects a message longer than 1000 characters', () => {
    const parsed = EnquiryBodySchema.safeParse({
      ...enquiry,
      message: 'a'.repeat(1001),
    });

    expect(parsed.success).toBe(false);
  });
});
