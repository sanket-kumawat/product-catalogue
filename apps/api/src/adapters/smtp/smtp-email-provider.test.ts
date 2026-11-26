import { describe, expect, it } from 'vitest';

import type { EmailMessage } from '../../ports/email-provider.js';
import {
  SmtpEmailProvider,
  smtpTransportOptions,
} from './smtp-email-provider.js';

const smtp = {
  smtpHost: 'localhost',
  smtpPort: 1025,
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
};

describe('smtpTransportOptions', () => {
  it('omits auth when the SMTP user is empty', () => {
    const options = smtpTransportOptions(smtp);

    expect(options.auth).toBeUndefined();
    expect(options).toMatchObject({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });

  it('includes auth when an SMTP user is set', () => {
    const options = smtpTransportOptions({
      ...smtp,
      smtpUser: 'mailer',
      smtpPass: 'secret',
    });

    expect(options.auth).toEqual({ user: 'mailer', pass: 'secret' });
  });
});

describe('SmtpEmailProvider', () => {
  it('forwards the message to the transport', async () => {
    const sent: EmailMessage[] = [];
    const provider = new SmtpEmailProvider(smtp, {
      async sendMail(message) {
        sent.push(message);
      },
    });
    const message: EmailMessage = {
      to: 'sales@product-catalogue.local',
      from: 'no-reply@product-catalogue.local',
      replyTo: 'ada@example.com',
      subject: 'Enquiry: Jacket',
      text: 'Hello',
      html: '<p>Hello</p>',
    };

    await provider.send(message);

    expect(sent).toEqual([message]);
  });
});
