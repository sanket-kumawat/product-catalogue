import nodemailer from 'nodemailer';

import type { AppConfig } from '../../config.js';
import type {
  EmailMessage,
  EmailProvider,
} from '../../ports/email-provider.js';

export type SmtpConfig = Pick<
  AppConfig,
  'smtpHost' | 'smtpPort' | 'smtpSecure' | 'smtpUser' | 'smtpPass'
>;

export type SmtpTransportOptions = {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
};

type MailSender = {
  sendMail(message: EmailMessage): Promise<unknown>;
};

export function smtpTransportOptions(config: SmtpConfig): SmtpTransportOptions {
  const options: SmtpTransportOptions = {
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
  };
  if (config.smtpUser) {
    options.auth = { user: config.smtpUser, pass: config.smtpPass };
  }
  return options;
}

export class SmtpEmailProvider implements EmailProvider {
  private readonly sender: MailSender;

  constructor(config: SmtpConfig, sender?: MailSender) {
    this.sender =
      sender ?? nodemailer.createTransport(smtpTransportOptions(config));
  }

  async send(message: EmailMessage): Promise<void> {
    await this.sender.sendMail(message);
  }
}
