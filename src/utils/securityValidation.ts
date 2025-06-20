
import { z } from 'zod';

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
};

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .transform((email) => sanitizeInput(email));

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Survey answer validation
export const surveyAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.union([
    z.string().max(500, 'Answer too long').transform(sanitizeInput),
    z.number().min(0).max(10),
    z.array(z.string().max(100).transform(sanitizeInput)).max(10)
  ])
});

// Habit validation
export const habitSchema = z.object({
  title: z.string()
    .min(1, 'Habit title is required')
    .max(100, 'Habit title too long')
    .transform(sanitizeInput),
  pillar: z.enum(['Career', 'Health', 'Financials', 'Connections']),
  status: z.enum(['active', 'established', 'paused']).optional()
});

// Check-in validation
export const checkinSchema = z.object({
  habit_id: z.string().uuid('Invalid habit ID'),
  week: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  result: z.enum(['gold', 'silver', 'none'])
});

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now - userLimit.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
};

// Content Security Policy helper
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

// Validate file uploads (for future use)
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};
