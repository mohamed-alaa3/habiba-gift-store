/**
 * Development environment.
 * API_BASE_URL points to the local backend.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'] as const,
};