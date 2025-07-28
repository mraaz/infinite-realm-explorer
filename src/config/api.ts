
import { logger } from '@/utils/logger';

// API Gateway configuration
export const API_GATEWAY_URL = 'https://ffwkwcix01.execute-api.us-east-1.amazonaws.com/prod';
// Note: This should be replaced with your actual API Gateway URL
// For development, you might want to use a different URL
logger.debug('API Gateway URL configured', { url: API_GATEWAY_URL });
