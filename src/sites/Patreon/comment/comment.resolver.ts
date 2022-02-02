import { Args, ID, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PatreonCommentDto } from './comment.dto';
import { PatreonComment } from './comment.entity';
import { PatreonCommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/apikey/apikey.guard';
import { PatreonPost } from '../post/post.entity';
import { PatreonAttachment } from '../attachment/attachment.entity';
import { PatreonPostLoader } from '../post/post.loader';
import { Loader } from 'src/utils/dataloader';
import DataLoader from 'dataloader';

@Resolver(() => PatreonComment)
export class PatreonCommentResolver {
    constructor(
        private readonly patreonCommentService: PatreonCommentService,
        private readonly patreonPostLoader: PatreonPostLoader,
    ) {}

    @Mutation(() => [PatreonComment])
    @UseGuards(ApiKeyGuard)
    async addPatreonPostComments(
        @Args('comments', { type: () => [PatreonCommentDto] }) comments: PatreonCommentDto[],
        @Args('postId', { type: () => ID }) postId: number,
    ): Promise<PatreonComment[]> {
        return await this.patreonCommentService.addComments(comments, postId);
    }

    @ResolveField(() => PatreonPost)
    async post(
        @Parent() self: PatreonAttachment,
        @Loader(PatreonPostLoader) loader: DataLoader<PatreonPost['id'], PatreonPost>,
    ): Promise<PatreonPost | Error> {
        return loader.load(self.postId);
    }
}
