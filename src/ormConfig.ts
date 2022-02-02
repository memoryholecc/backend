import { ConnectionOptions } from 'typeorm';
import { env } from './utils/env';

export const ormConfig: ConnectionOptions = {
    type: 'mysql',
    url: env.DATABASE_URL,
    synchronize: false,
    migrationsRun: false,
    logging: env.ENV === 'development',
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    timezone: 'Z',
};
