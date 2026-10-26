import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_CONTACT_EMAIL: z.string().email(),
});

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  VITE_CONTACT_EMAIL: import.meta.env.VITE_CONTACT_EMAIL ?? 'hello@wymnet.ai',
});

if (!parsed.success) {
  throw new Error(
    `Invalid frontend environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
  );
}

export const env = parsed.data;
