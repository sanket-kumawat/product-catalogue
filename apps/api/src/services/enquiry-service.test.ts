import type { EnquiryBody } from '@product-catalogue/shared';
import { describe, expect, it } from 'vitest';

import type { EmailMessage, EmailProvider } from '../ports/email-provider.js';
import { InMemoryProductRepository } from '../test/in-memory-product-repository.js';
import { makeProduct } from '../test/products.js';
import { EnquiryService } from './enquiry-service.js';

const enquiry: EnquiryBody = {
  productId: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: '<script>',
};

function service(email: EmailProvider, title = 'Jacket'): EnquiryService {
  return new EnquiryService(
    new InMemoryProductRepository([
      makeProduct({
        id: 1,
        title,
        category: "men's clothing",
        rating: 4,
        ratingCount: 10,
      }),
    ]),
    email,
    {
      emailFrom: 'no-reply@product-catalogue.local',
      salesInboxEmail: 'sales@product-catalogue.local',
    },
  );
}

describe('EnquiryService', () => {
  it('does not send when the product does not exist', async () => {
    const sent: EmailMessage[] = [];
    const email: EmailProvider = {
      async send(message) {
        sent.push(message);
      },
    };

    await expect(
      service(email).submit({ ...enquiry, productId: 99 }),
    ).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    expect(sent).toEqual([]);
  });

  it('sends escaped HTML, a raw plain-text part, and a single-line subject', async () => {
    const sent: EmailMessage[] = [];
    const email: EmailProvider = {
      async send(message) {
        sent.push(message);
      },
    };

    await service(email, 'Jacket\r\nBcc: evil@example.com').submit({
      ...enquiry,
      email: 'ada@example.com\n',
    });

    const message = sent[0];
    expect(message?.html).toContain('&lt;script&gt;');
    expect(message?.html).not.toContain('<script>');
    expect(message?.text).toContain('<script>');
    expect(message?.subject).toBe('Enquiry: JacketBcc: evil@example.com');
    expect(message?.subject).not.toMatch(/[\r\n]/);
    expect(message?.replyTo).toBe('ada@example.com');
    expect(message?.replyTo).not.toMatch(/[\r\n]/);
    expect(message?.to).toBe('sales@product-catalogue.local');
    expect(message?.from).toBe('no-reply@product-catalogue.local');
  });

  it('returns 502 when sending fails and hides the transport error', async () => {
    const email: EmailProvider = {
      async send() {
        throw new Error('smtp secret');
      },
    };

    await expect(service(email).submit(enquiry)).rejects.toMatchObject({
      status: 502,
      code: 'UPSTREAM_ERROR',
      message: 'Enquiry email could not be sent',
    });
  });
});
