export const DEFAULT_EXPO_WEB_ORIGIN = 'http://localhost:8081';

export function getApiCorsOptions(expoWebOrigin?: string) {
  const allowedOrigin = expoWebOrigin?.trim() || DEFAULT_EXPO_WEB_ORIGIN;

  return {
    origin: [allowedOrigin],
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  };
}
