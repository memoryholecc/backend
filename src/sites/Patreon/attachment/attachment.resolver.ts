import { Args, ID, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PatreonAttachmentDto } from './attachment.dto';
import { PatreonAttachment } from './attachment.entity';
import { PatreonAttachmentService } from './attachment.service';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/apikey/apikey.guard';
import { Creator } from 'src/data/creator/creator.entity';
import { CreatorLoader } from 'src/data/creator/creator.loader';
import { PatreonPost } from '../post/post.entity';
import { PatreonPostLoader } from '../post/post.loader';
import { Loader } from 'src/utils/dataloader';
import DataLoader from 'dataloader';

@Resolver(() => PatreonAttachment)
export class PatreonAttachmentResolver {
    constructor(
        private readonly patreonAttachmentService: PatreonAttachmentService,
        private readonly creatorLoader: CreatorLoader,
        private readonly patreonPostLoader: PatreonPostLoader,
    ) {}

    @Mutation(() => [PatreonAttachment])
    @UseGuards(ApiKeyGuard)
    async addPatreonPostAttachments(
        @Args('attachments', { type: () => [PatreonAttachmentDto] })
        attachments: PatreonAttachmentDto[],
        @Args('postId', { type: () => ID }) postId: number,
    ): Promise<PatreonAttachment[]> {
        return await this.patreonAttachmentService.addAttachments(attachments, postId);
    }

    @ResolveField(() => Creator)
    async creator(
        @Parent() self: PatreonAttachment,
        @Loader() loader: DataLoader<Creator['id'], Creator>,
    ): Promise<Creator | Error> {
        return loader.load(self.creatorId);
    }

    @ResolveField(() => PatreonPost)
    async post(
        @Parent() self: PatreonAttachment,
        @Loader(PatreonPostLoader) loader: DataLoader<PatreonPost['id'], PatreonPost>,
    ): Promise<PatreonPost | Error> {
        return loader.load(self.postId);
    }
}
