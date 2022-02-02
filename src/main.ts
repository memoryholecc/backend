import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastifyHelmet } from 'fastify-helmet';
import { env } from './utils/env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function start() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: false, bodyLimit: 10485760 }),
        {
            // See: https://github.com/fastify/fastify-cors#options
            cors: {
                origin: env.ENV === 'production' ? 'https://memoryhole.cc' : '*',

                // Authorization is not currently used by the frontend but may be used in the future.
                // Content-Type must be explicitly allowed as 'application/json' is not safe listed.
                // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
                allowedHeaders: ['Authorization', 'Content-Type'],

                // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
                credentials: true,

                // Quirk: Different browsers have different maximum times.
                // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
                maxAge: 86400,

                // GraphQL only needs GET and POST.
                // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
                methods: ['GET', 'POST'],

                preflightContinue: false,
            },
        },
    );

    app.register(fastifyHelmet, {
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'", 'cdn.jsdelivr.net'],
                scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
                styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
                imgSrc: ["'self'", 'cdn.jsdelivr.net'],
            },
        },
    });

    app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));

    await app.listen(env.PORT || 3000, '0.0.0.0').catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
