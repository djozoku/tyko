declare namespace NodeJS {
  declare interface ProcessEnv {
    HOST_ADDRESS: string;
    FRONTEND_URL: string;
    SESSION_SECRET: string;
    JWT_SECRET: string;
    TEACHER_EMAIL_DOMAIN: string;
    STUDENT_EMAIL_DOMAIN: string;
    MICROSOFT_AUTH_ENABLE?: string;
    MICROSOFT_APP_ID?: string;
    MICROSOFT_APP_SECRET?: string;
    MICROSOFT_AUTHORITY?: string;
    MICROSOFT_DOMAIN_HINT?: string;
    DISCORD_AUTH_ENABLE?: string;
    DISCORD_APP_ID?: string;
    DISCORD_APP_SECRET?: string;
    REDIS_HOST?: string;
  }
}
