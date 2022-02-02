import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Creator } from './creator/creator.entity';
import { CreatorService } from './creator/creator.service';
import { CreatorResolver } from './creator/creator.resolver';
import { PatreonModule } from '../sites/Patreon/patreon.module';
import { PatreonCreatorService } from '../sites/Patreon/creator/patreonCreator.service';
import { CreatorLoader } from './creator/creator.loader';
import { PrismaService } from 'src/prisma.service';

@Module({
    imports: [TypeOrmModule.forFeature([Creator]), forwardRef(() => PatreonModule)],
    providers: [
        CreatorLoader,
        CreatorResolver,
        CreatorService,
        PatreonCreatorService,
        PrismaService,
    ],
    exports: [CreatorLoader, CreatorService],
})
export class DataModule {}
