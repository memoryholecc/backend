import * as dotenv from 'dotenv';

dotenv.config();

interface Env {
    ENV: string;
    API_KEY: string;
    PORT: number;
    DATABASE_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    CACHE_LIFETIME: number;
}

export const env: Env = {
    // Environment
    ENV: process.env.ENV || 'production',

    // Auth
    API_KEY: process.env.API_KEY,

    // API
    PORT: parseInt(process.env.PORT),

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // Redis Cache
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: parseInt(process.env.CACHE_TIME),
    CACHE_LIFETIME: parseInt(process.env.CACHE_LIFETIME),
};
