import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  IMPERSONATE_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_INDIE_PRICE_ID: z.string().min(1),
  STRIPE_PRO_PRICE_ID: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
