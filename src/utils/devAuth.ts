import { logger } from '@/utils/logger';

// Development mode detection
export const isDevelopment = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// Mock JWT generator for development
export const generateMockJWT = (): string => {
  if (!isDevelopment()) {
    logger.warn('Attempted to generate mock JWT in production');
    throw new Error('Mock JWT generation is only available in development');
  }

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: '74b38e01-ca4b-4889-b8ee-Raaz',
    email: 'dev@localhost.com',
    name: 'Dev User',
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours from now
  };

  // Base64 encode header and payload (for development purposes only)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Simple mock signature (not cryptographically secure - for dev only)
  const signature = btoa(`dev-signature-${now}`);

  const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  logger.debug('Generated mock JWT for development', { 
    sub: payload.sub,
    email: payload.email,
    exp: new Date(payload.exp * 1000).toISOString()
  });

  return jwt;
};

export const DEV_USER_CONFIG = {
  sub: '74b38e01-ca4b-4889-b8ee-Raaz',
  email: 'dev@localhost.com',
  name: 'Dev User'
} as const;