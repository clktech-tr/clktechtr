import { z } from 'zod';

// Simple schema definitions for the backend
export const insertProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  externalLinks: z.any().optional(),
});

export const insertOrderSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  productId: z.number().optional(),
  productName: z.string().optional(),
  message: z.string().optional(),
  status: z.string().optional(),
});

export const insertContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  captchaAnswer: z.number().optional(),
});