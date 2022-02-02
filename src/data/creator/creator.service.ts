import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Creator } from './creator.entity';
import { In, Repository } from 'typeorm';
import { LimitArg, SortBy } from '../../utils/ArgsTypes';
import { CreatorDto } from './creator.dto';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '.prisma/client';
import { isEmpty } from 'class-validator';
import { getPrismaSelectString } from 'src/utils/GetPrismaSelectString';

@Injectable()
export class CreatorService {
    constructor(
        @InjectRepository(Creator)
        private readonly creatorRepository: Repository<Creator>,
        private readonly prisma: PrismaService,
    ) {}

    async getAll(
        info: GraphQLResolveInfo,
        sort = SortBy.LAST_CREATED,
        limit = LimitArg.getAllCreators.default,
        skip: number,
    ): Promise<Creator[]> {
        if (limit > LimitArg.getAllCreators.max) {
            throw new Error(
                `Your "limit" argument exceeds our maxim (${LimitArg.getAllCreators.max})`,
            );
        }

        const select = getPrismaSelectString(info);

        const orderBy: Prisma.Enumerable<Prisma.creatorOrderByWithRelationInput> = {};

        switch (sort) {
            case SortBy.LAST_CREATED:
                orderBy.created = 'desc';
                break;

            case SortBy.NAME:
                orderBy.name = 'asc';
                break;

            case SortBy.LAST_UPDATED:
                orderBy.lastUpdated = 'desc';
                break;

            default:
                orderBy.name = 'asc';
        }

        return this.prisma.creator.findMany({
            take: limit,
            skip,
            orderBy,
            ...select,
        });
    }

    async create(creatorDto: CreatorDto) {
        if (creatorDto.name.trim().length == 0) {
            throw new BadRequestException(creatorDto.name, 'The name must not be empty');
        }
        const creator = new Creator();
        creator.name = creatorDto.name;
        creator.profilePicture = creatorDto.profilePicture;
        creator.bannerPicture = creatorDto.bannerPicture;

        return this.creatorRepository.save(creator);
    }

    async findById(id: string, info?: GraphQLResolveInfo): Promise<Creator> {
        const select = getPrismaSelectString(info);
        const creator = await this.prisma.creator.findFirst({
            where: { id },
            ...select,
        });
        return creator;
    }

    async searchByName(
        name: string,
        info: GraphQLResolveInfo,
        sort = SortBy.NAME,
        limit: number,
        skip: number,
    ): Promise<Creator[]> {
        if (isEmpty(name)) throw new BadRequestException('Empty "name" argument');
        if (limit > LimitArg.getAllCreators.max) {
            throw new Error(
                `Your "limit" argument exceeds our maxim (${LimitArg.getAllCreators.max})`,
            );
        }

        const select = getPrismaSelectString(info);
        const orderBy: Prisma.Enumerable<Prisma.creatorOrderByWithRelationInput> = {};

        switch (sort) {
            case SortBy.LAST_CREATED:
                orderBy.created = 'desc';
                break;

            case SortBy.NAME:
                orderBy.name = 'asc';
                break;

            case SortBy.LAST_UPDATED:
                orderBy.lastUpdated = 'desc';
                break;

            default:
                orderBy.name = 'asc';
        }

        const result = await this.prisma.creator.findMany({
            where: {
                name: {
                    contains: name,
                },
            },

            skip,
            take: limit,
            orderBy,
            ...select,
        });

        return result;
    }

    // Differs from findByIds by checking the number of creators requested.
    async getByIds(ids: string[], info: GraphQLResolveInfo, sort?: SortBy): Promise<Creator[]> {
        const select = getPrismaSelectString(info);

        if (ids.length > LimitArg.getAllCreators.max) {
            throw new Error(
                `The number of creators you are requesting exceeds our maxim (${LimitArg.getAllCreators.max})`,
            );
        }

        const orderBy: Prisma.Enumerable<Prisma.creatorOrderByWithRelationInput> = {};

        switch (sort) {
            case SortBy.LAST_CREATED:
                orderBy.created = 'desc';
                break;

            case SortBy.NAME:
                orderBy.name = 'asc';
                break;

            case SortBy.LAST_UPDATED:
                orderBy.lastUpdated = 'desc';
                break;
        }

        const result = await this.prisma.creator.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            orderBy,
            ...select,
        });

        return result;
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly Creator['id'][]) {
        return this.creatorRepository.find({
            where: { id: In(ids as Creator['id'][]) },
            cache: true,
        });
    }
}
