/// <reference types="next" />
/// <reference types="next/types/global" />
declare namespace NodeJS {
  declare interface ProcessEnv {
    NEXT_PUBLIC_API_SERVER: string;
    NEXT_PUBLIC_AUTH_SERVER: string;
    TOKEN_SECRET: string;
  }
}
