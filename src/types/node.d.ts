// This file adds Node.js global types to the project
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    EMAIL_SERVER_HOST: string;
    EMAIL_SERVER_PORT: string;
    EMAIL_SERVER_USER: string;
    EMAIL_SERVER_PASSWORD: string;
    EMAIL_FROM: string;
    // FIREBASE_API_KEY: string;
    // FIREBASE_AUTH_DOMAIN: string;
    // FIREBASE_PROJECT_ID: string;
    // FIREBASE_STORAGE_BUCKET: string;
    // FIREBASE_MESSAGING_SENDER_ID: string;
    // FIREBASE_APP_ID: string;
  }
}
