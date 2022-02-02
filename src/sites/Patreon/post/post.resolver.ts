import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PatreonPostService } from './post.service';
import { PatreonPostDto } from './post.dto';
import { PatreonPost } from './post.entity';
import { LimitArg, SortBy } from 'src/utils/ArgsTypes';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/apikey/apikey.guard';
import { PatreonAttachment } from '../attachment/attachment.entity';
import { PatreonComment } from '../comment/comment.entity';
import { PatreonCreator } from '../creator/patreonCreator.entity';
import { PatreonAttachmentLoader } from '../attachment/attachment.loader';
import { PatreonCommentLoader } from '../comment/comment.loader';
import { PatreonCreatorLoader } from '../creator/patreonCreator.loader';
import { Loader } from 'src/utils/dataloader';
import DataLoader from 'dataloader';

@Resolver(() => PatreonPost)
export class PatreonPostResolver {
    constructor(
        private readonly patreonPostService: PatreonPostService,
        private readonly patreonAttachmentLoader: PatreonAttachmentLoader,
        private readonly patreonCommentLoader: PatreonCommentLoader,
        private readonly patreonCreatorLoader: PatreonCreatorLoader,
    ) {}

    @Mutation(() => [PatreonPost])
    @UseGuards(ApiKeyGuard)
    async addPatreonPosts(
        @Args('posts', { type: () => [PatreonPostDto] }) posts: PatreonPostDto[],
        @Args('creatorCampaignId', { type: () => ID }) creatorCampaignId: number,
    ): Promise<PatreonPost[]> {
        return await this.patreonPostService.addPosts(posts, creatorCampaignId);
    }

    @Query(() => [PatreonPost])
    async getPatreonPosts(
        @Args('campaignId', { type: () => ID }) campaignId: number,
        @Args('sortBy', { type: () => SortBy, nullable: true }) sort?: SortBy,
        @Args('limit', {
            type: () => Int,
            nullable: true,
            defaultValue: LimitArg.getPatreonPosts.default,
        })
        limit?: number,
        @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
    ): Promise<PatreonPost[]> {
        return await this.patreonPostService.getPosts(campaignId, sort, limit, skip);
    }

    @Query(() => PatreonPost)
    async getPatreonPostById(
        @Args('postId', { type: () => ID }) postId: number,
    ): Promise<PatreonPost> {
        return await this.patreonPostService.getPostById(postId);
    }

    @ResolveField(() => [PatreonAttachment])
    async attachments(
        @Parent() self: PatreonPost,
        @Loader(PatreonAttachmentLoader)
        loader: DataLoader<PatreonAttachment['id'], PatreonAttachment>,
    ): Promise<(PatreonAttachment | Error)[]> {
        return loader.loadMany(self.attachmentIds);
    }

    @ResolveField(() => [PatreonComment])
    async comments(
        @Parent() self: PatreonPost,
        @Loader(PatreonCommentLoader) loader: DataLoader<PatreonComment['id'], PatreonComment>,
    ): Promise<(PatreonComment | Error)[]> {
        return loader.loadMany(self.commentIds);
    }

    @ResolveField(() => PatreonCreator)
    async creator(
        @Parent() self: PatreonPost,
        @Loader(PatreonCreatorLoader)
        loader: DataLoader<PatreonCreator['campaignId'], PatreonCreator>,
    ): Promise<PatreonCreator | Error> {
        return loader.load(self.creatorId);
    }
}
