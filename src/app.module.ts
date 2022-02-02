import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './ormConfig';
import { DataModule } from './data/data.module';
import { GraphQLModule } from '@nestjs/graphql';
import { SitesModule } from './sites/sites.module';
import { join } from 'path';
import { env } from './utils/env';
import depthLimit = require('graphql-depth-limit');
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from './utils/dataloader';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...ormConfig,
            keepConnectionAlive: true,
        }),
        GraphQLModule.forRoot({
            context: ({ req }) => ({ req }),
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            introspection: true,
            playground: true,
            cors: false, // CORS is configured in main.ts and must be disabled here to prevent conflicts
            validationRules: [
                // ! \\ As query complexity can potentially increase exponentially with depth, it has to be highly restricted in production.
                // A limit of 2 allows for 'getAllCreators' to request Creators and associated Patreons but prevents pulling posts (extremely complex)
                // The official frontend does not use any queries over two layers deep.
                depthLimit(env.ENV === 'production' ? 2 : 100),
            ],
        }),
        DataModule,
        SitesModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: DataLoaderInterceptor,
        },
    ],
})
export class AppModule {}
