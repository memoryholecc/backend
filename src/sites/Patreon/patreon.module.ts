import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatreonCreator } from './creator/patreonCreator.entity';
import { PatreonPost } from './post/post.entity';
import { PatreonComment } from './comment/comment.entity';
import { PatreonAttachment } from './attachment/attachment.entity';
import { PatreonCreatorService } from './creator/patreonCreator.service';
import { PatreonCreatorResolver } from './creator/patreonCreator.resolver';
import { PatreonPostService } from './post/post.service';
import { PatreonPostResolver } from './post/post.resolver';
import { Creator } from 'src/data/creator/creator.entity';
import { PatreonCommentService } from './comment/comment.service';
import { PatreonCommentResolver } from './comment/comment.resolver';
import { PatreonAttachmentService } from './attachment/attachment.service';
import { PatreonAttachmentResolver } from './attachment/attachment.resolver';
import { PatreonEmbedService } from './embed/embed.service';
import { PatreonEmbed } from './embed/embed.entity';
import { PatreonAttachmentLoader } from './attachment/attachment.loader';
import { PatreonCommentLoader } from './comment/comment.loader';
import { PatreonCreatorLoader } from './creator/patreonCreator.loader';
import { PatreonEmbedLoader } from './embed/embed.loader';
import { PatreonPostLoader } from './post/post.loader';
import { DataModule } from 'src/data/data.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PatreonCreator,
            PatreonPost,
            PatreonComment,
            PatreonAttachment,
            PatreonEmbed,
            Creator,
        ]),
        forwardRef(() => DataModule),
    ],
    providers: [
        PatreonAttachmentLoader,
        PatreonAttachmentService,
        PatreonAttachmentResolver,
        PatreonCommentLoader,
        PatreonCommentService,
        PatreonCommentResolver,
        PatreonCreatorLoader,
        PatreonCreatorService,
        PatreonCreatorResolver,
        PatreonEmbedLoader,
        PatreonEmbedService,
        PatreonPostLoader,
        PatreonPostService,
        PatreonPostResolver,
    ],
    exports: [
        TypeOrmModule.forFeature([
            PatreonCreator,
            PatreonPost,
            PatreonComment,
            PatreonAttachment,
            PatreonEmbed,
        ]),
        PatreonCreatorLoader,
        PatreonCreatorService,
        PatreonPostService,
    ],
})
export class PatreonModule {}
