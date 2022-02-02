import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { PatreonCreatorService } from './patreonCreator.service';
import { PatreonCreator } from './patreonCreator.entity';
import { PatreonCreatorDto } from './patreonCreator.dto';
import { LimitArg } from 'src/utils/ArgsTypes';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/apikey/apikey.guard';
import { Creator } from 'src/data/creator/creator.entity';
import { CreatorLoader } from 'src/data/creator/creator.loader';
import { PatreonPost } from '../post/post.entity';
import { PatreonPostLoader } from '../post/post.loader';
import { Loader } from 'src/utils/dataloader';
import DataLoader from 'dataloader';

@Resolver(() => PatreonCreator)
export class PatreonCreatorResolver {
    constructor(
        private readonly patreonCreatorService: PatreonCreatorService,
        private readonly creatorLoader: CreatorLoader,
        private readonly patreonPostLoader: PatreonPostLoader,
    ) {}

    @Query(() => [PatreonCreator])
    async getPatreonsByCreatorId(
        @Args('creatorId', { type: () => ID }) creatorId: string,
    ): Promise<PatreonCreator[]> {
        return this.patreonCreatorService.findByCreatorId(creatorId);
    }

    @Query(() => PatreonCreator)
    async getPatreonByCampaignId(
        @Args('campaignId', { type: () => ID }) campaignId: number,
    ): Promise<PatreonCreator> {
        return this.patreonCreatorService.findByCampaignId(campaignId);
    }

    @Query(() => [PatreonCreator])
    async getPatreonByCampaignIds(
        @Args('campaignIds', { type: () => [ID] }) campaignIds: number[],
    ): Promise<(PatreonCreator | Error)[]> {
        return this.patreonCreatorService.findByIds(campaignIds);
    }

    @Query(() => [PatreonCreator], { defaultValue: [] })
    async searchPatreonsByName(
        @Args('name', { type: () => String }) name: string,
        @Args('limit', {
            type: () => Int,
            nullable: true,
            defaultValue: LimitArg.getAllPatreon.default,
        })
        limit?: number,
    ): Promise<PatreonCreator[]> {
        return this.patreonCreatorService.searchByName(name, limit);
    }

    @Mutation(() => PatreonCreator)
    @UseGuards(ApiKeyGuard)
    async createPatreon(
        @Args('patreon', { type: () => PatreonCreatorDto }) patreon: PatreonCreatorDto,
        @Args('creatorId', { type: () => ID }) creatorId: string,
    ): Promise<PatreonCreator> {
        return this.patreonCreatorService.createPatreon(patreon, creatorId);
    }

    @ResolveField(() => Creator)
    async creator(
        @Parent() self: PatreonCreator,
        @Loader(CreatorLoader) loader: DataLoader<Creator['id'], Creator>,
    ): Promise<Creator | Error> {
        return loader.load(self.creatorId);
    }

    @ResolveField(() => [PatreonPost])
    async posts(
        @Parent() self: PatreonCreator,
        @Loader(PatreonPostLoader) loader: DataLoader<PatreonPost['id'], PatreonPost>,
    ): Promise<(PatreonPost | Error)[]> {
        return loader.loadMany(self.postIds);
    }
}
