import type { EnquiryBody } from '@product-catalogue/shared';

import {
  renderEnquiryEmail,
  stripHeaderValue,
} from '../adapters/smtp/render-enquiry-email.js';
import type { AppConfig } from '../config.js';
import type { EmailProvider } from '../ports/email-provider.js';
import type { ProductRepository } from '../ports/product-repository.js';
import { AppError, notFound, upstreamError } from './errors.js';

export class EnquiryService {
  constructor(
    private readonly products: ProductRepository,
    private readonly email: EmailProvider,
    private readonly mail: Pick<AppConfig, 'emailFrom' | 'salesInboxEmail'>,
  ) {}

  async submit(enquiry: EnquiryBody): Promise<void> {
    const product = await this.products.getProductById(enquiry.productId);
    if (!product) {
      throw notFound(`Product ${enquiry.productId} not found`);
    }

    const rendered = renderEnquiryEmail({
      productTitle: product.title,
      name: enquiry.name,
      email: enquiry.email,
      ...(enquiry.phone === undefined ? {} : { phone: enquiry.phone }),
      message: enquiry.message,
    });

    try {
      await this.email.send({
        to: stripHeaderValue(this.mail.salesInboxEmail),
        from: stripHeaderValue(this.mail.emailFrom),
        replyTo: stripHeaderValue(enquiry.email),
        subject: stripHeaderValue(`Enquiry: ${product.title}`),
        text: rendered.text,
        html: rendered.html,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw upstreamError('Enquiry email could not be sent');
    }
  }
}
