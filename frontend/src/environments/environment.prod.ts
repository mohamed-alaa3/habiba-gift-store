/**
 * Production environment.
 * Update apiBaseUrl when deploying.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.habiba-store.example/api',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'] as const,
};