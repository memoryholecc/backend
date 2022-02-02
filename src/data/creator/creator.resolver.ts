import { Args, ID, Info, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatorService } from './creator.service';
import { Creator } from './creator.entity';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { LimitArg, SortBy } from '../../utils/ArgsTypes';
import { CreatorDto } from './creator.dto';
import { ApiKeyGuard } from 'src/auth/apikey/apikey.guard';
import { GraphQLResolveInfo } from 'graphql';

@Resolver(() => Creator)
export class CreatorResolver {
    constructor(private readonly creatorService: CreatorService) {}

    @Query(() => [Creator], { nullable: false, defaultValue: [] })
    async getAllCreators(
        @Info() info: GraphQLResolveInfo,
        @Args('sortBy', { type: () => SortBy, nullable: true }) sort?: SortBy,
        @Args('limit', {
            type: () => Int,
            nullable: true,
            defaultValue: LimitArg.getAllCreators.default,
        })
        limit?: number,
        @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
    ): Promise<Creator[]> {
        return this.creatorService.getAll(info, sort, limit, skip);
    }

    @Query(() => Creator)
    async getCreatorById(
        @Info() info: GraphQLResolveInfo,
        @Args('creatorId', { type: () => ID }) creatorId: string,
    ): Promise<Creator> {
        const creator = this.creatorService.findById(creatorId, info);
        if (!creator) {
            throw new NotFoundException(`No creator found with this id (${creatorId}).`);
        }
        return creator;
    }

    @Query(() => [Creator])
    async getCreatorsByIds(
        @Info() info: GraphQLResolveInfo,
        @Args('creatorIds', { type: () => [ID] }) creatorIds: string[],
        @Args('sortBy', { type: () => SortBy, nullable: true }) sort?: SortBy,
    ): Promise<Creator[]> {
        return this.creatorService.getByIds(creatorIds, info, sort);
    }

    // Maybe we can merge search methods?
    @Query(() => [Creator])
    async searchCreatorByName(
        @Info() info: GraphQLResolveInfo,
        @Args('name', { type: () => String }) name: string,
        @Args('sortBy', { type: () => SortBy, nullable: true }) sort?: SortBy,
        @Args('limit', {
            type: () => Int,
            nullable: true,
            defaultValue: LimitArg.getAllCreators.default,
        })
        limit?: number,
        @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
    ): Promise<Creator[]> {
        return this.creatorService.searchByName(name, info, sort, limit, skip);
    }

    @Mutation(() => Creator)
    @UseGuards(ApiKeyGuard)
    async createCreator(
        @Args('creator', { type: () => CreatorDto, nullable: false }) creator: CreatorDto,
    ): Promise<Creator> {
        return this.creatorService.create(creator);
    }
}
