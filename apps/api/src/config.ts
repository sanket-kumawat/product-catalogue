import { flattenError, z, ZodError } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  FAKE_STORE_BASE_URL: z.url().default('https://fakestoreapi.com'),
  PRODUCT_CACHE_TTL_MS: z.coerce.number().int().positive().default(300_000),
  FEATURED_PRODUCT_IDS: z.string().default(''),
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.enum(['true', 'false']).default('false'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.email().default('no-reply@product-catalogue.local'),
  SALES_INBOX_EMAIL: z.email().default('sales@product-catalogue.local'),
  ENQUIRY_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60_000),
  ENQUIRY_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
});

export type AppConfig = {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  corsOrigin: string;
  fakeStoreBaseUrl: string;
  productCacheTtlMs: number;
  featuredProductIds: readonly number[];
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  emailFrom: string;
  salesInboxEmail: string;
  enquiryRateLimitWindowMs: number;
  enquiryRateLimitMax: number;
};

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): AppConfig {
  let parsed: z.infer<typeof EnvSchema>;
  try {
    parsed = EnvSchema.parse(env);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(
        `Invalid environment:\n${JSON.stringify(flattenError(error), null, 2)}`,
      );
    }
    throw error;
  }

  return {
    port: parsed.PORT,
    nodeEnv: parsed.NODE_ENV,
    corsOrigin: parsed.CORS_ORIGIN,
    fakeStoreBaseUrl: parsed.FAKE_STORE_BASE_URL,
    productCacheTtlMs: parsed.PRODUCT_CACHE_TTL_MS,
    featuredProductIds: parseFeaturedProductIds(parsed.FEATURED_PRODUCT_IDS),
    smtpHost: parsed.SMTP_HOST,
    smtpPort: parsed.SMTP_PORT,
    smtpSecure: parsed.SMTP_SECURE === 'true',
    smtpUser: parsed.SMTP_USER,
    smtpPass: parsed.SMTP_PASS,
    emailFrom: parsed.EMAIL_FROM,
    salesInboxEmail: parsed.SALES_INBOX_EMAIL,
    enquiryRateLimitWindowMs: parsed.ENQUIRY_RATE_LIMIT_WINDOW_MS,
    enquiryRateLimitMax: parsed.ENQUIRY_RATE_LIMIT_MAX,
  };
}

export function parseFeaturedProductIds(value: string): number[] {
  if (value.trim() === '') {
    return [];
  }

  const ids: number[] = [];
  for (const part of value.split(',')) {
    const token = part.trim();
    if (token === '') {
      continue;
    }
    if (!/^[1-9]\d*$/.test(token)) {
      throw new Error(`Invalid FEATURED_PRODUCT_IDS entry "${token}"`);
    }
    ids.push(Number(token));
  }
  return ids;
}
