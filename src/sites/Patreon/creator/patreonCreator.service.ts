import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatreonCreator } from './patreonCreator.entity';
import { getConnection, In, Like, QueryRunner, Repository } from 'typeorm';
import { PatreonCreatorDto } from './patreonCreator.dto';
import { CreatorService } from '../../../data/creator/creator.service';
import { ModuleRef } from '@nestjs/core';
import { PatreonPostService } from '../post/post.service';
import { Creator } from 'src/data/creator/creator.entity';
import { LimitArg } from 'src/utils/ArgsTypes';

@Injectable()
export class PatreonCreatorService implements OnModuleInit {
    private creatorService: CreatorService;

    constructor(
        @InjectRepository(PatreonCreator)
        private readonly patreonCreatorRepository: Repository<PatreonCreator>,
        @Inject(forwardRef(() => PatreonPostService))
        private readonly patreonPostService: PatreonPostService,
        private readonly moduleRef: ModuleRef,
    ) {}

    onModuleInit() {
        this.creatorService = this.moduleRef.get(CreatorService, { strict: false });
    }

    async findByCreatorId(creatorId: string): Promise<PatreonCreator[]> {
        return this.patreonCreatorRepository.find({ where: { creator: creatorId } });
    }

    async findByCampaignId(campaignId: number): Promise<PatreonCreator> {
        return this.patreonCreatorRepository.findOne({
            where: { campaignId: campaignId },
        });
    }

    async createPatreon(
        patreonCreatorDto: PatreonCreatorDto,
        creator: Creator | string,
        currentTransaction?: QueryRunner,
    ): Promise<PatreonCreator> {
        // Retrieve the Creator
        let _creator: Creator;
        if (creator instanceof Creator) {
            _creator = creator;
        } else {
            _creator = await this.creatorService.findById(creator, null);
            if (_creator == null) {
                throw new Error(`Creator with ID : ${creator} not found.`);
            }
        }

        // Start (or retrieve) a transaction
        let queryRunner: QueryRunner;
        if (currentTransaction) {
            queryRunner = currentTransaction;
        } else {
            queryRunner = getConnection().createQueryRunner();
            await queryRunner.startTransaction();
        }

        try {
            const existingPatreon = await queryRunner.manager.findOne(
                PatreonCreator,
                patreonCreatorDto.campaignId,
            );
            const patreonCreatorExists = existingPatreon !== undefined;

            if (patreonCreatorExists) {
                await queryRunner.manager.update(PatreonCreator, patreonCreatorDto.campaignId, {
                    creator: Promise.resolve(_creator),
                    username: patreonCreatorDto.username,
                });
            } else {
                const patreon = new PatreonCreator();
                patreon.campaignId = patreonCreatorDto.campaignId;
                patreon.creator = Promise.resolve(_creator);
                patreon.username = patreonCreatorDto.username;
                patreon.posts = Promise.resolve([]);

                await queryRunner.manager.save(patreon);

                // Add posts
                /*
                if (Array.isArray(patreonCreatorDto.posts) && patreonCreatorDto.posts.length !== 0) {
                    patreon.posts = Promise.resolve(await this.patreonPostService.addPosts(patreonCreatorDto.posts, patreon, queryRunner));
                }
                */
                if (!currentTransaction) {
                    await queryRunner.commitTransaction();
                }

                return patreon;
            }
        } catch (err) {
            Logger.error(`Failed to add new Patreon Creator: ${err}`);
            if (!currentTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw new Error('Failed to add new Patreon Creator');
        } finally {
            if (!currentTransaction) await queryRunner.release();
        }
    }

    async searchByName(name: string, limit: number): Promise<PatreonCreator[]> {
        if (limit > LimitArg.getAllCreators.max)
            throw new Error(
                `Your "limit" argument exceeds our maxim (${LimitArg.getAllPatreon.max})`,
            );
        return this.patreonCreatorRepository.find({
            where: { username: Like(`%${name}%`) },
            take: limit,
        });
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly PatreonCreator['campaignId'][]) {
        return this.patreonCreatorRepository.find({
            where: { campaignId: In(ids as PatreonCreator['campaignId'][]) },
            cache: true,
        });
    }
}
