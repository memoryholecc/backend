import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: [
                {
                    level: 'error',
                    emit: 'stdout',
                },
                {
                    level: 'warn',
                    emit: 'stdout',
                },
                {
                    level: 'info',
                    emit: 'stdout',
                },
            ],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}
