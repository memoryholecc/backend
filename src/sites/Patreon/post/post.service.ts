import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, getConnection, In, QueryRunner, Repository } from 'typeorm';
import { PatreonPost } from './post.entity';
import { PatreonCreatorService } from '../creator/patreonCreator.service';
import { PatreonPostDto } from './post.dto';
import { ModuleRef } from '@nestjs/core';
import { PatreonCreator } from '../creator/patreonCreator.entity';
import { Creator } from 'src/data/creator/creator.entity';
import { LimitArg, SortBy } from 'src/utils/ArgsTypes';
import { PatreonCommentService } from '../comment/comment.service';
import { PatreonAttachmentService } from '../attachment/attachment.service';
import { PatreonEmbedService } from '../embed/embed.service';

@Injectable()
export class PatreonPostService {
    constructor(
        @InjectRepository(PatreonPost)
        private readonly patreonPostRepository: Repository<PatreonPost>,
        @Inject(forwardRef(() => PatreonAttachmentService))
        private readonly patreonAttachmentService: PatreonAttachmentService,
        @Inject(forwardRef(() => PatreonCreatorService))
        private readonly patreonCreatorService: PatreonCreatorService,
        @Inject(forwardRef(() => PatreonCommentService))
        private readonly patreonCommentService: PatreonCommentService,
        @Inject(forwardRef(() => PatreonEmbedService))
        private readonly patreonEmbedService: PatreonEmbedService,
        private readonly moduleRef: ModuleRef,
        @InjectRepository(Creator)
        private readonly creatorReposistory: Repository<Creator>,
    ) {}

    /**
     *
     * @param postDtos - posts to add
     * @param patreonCreator - patreon campaign ID OR PatreonCreator entity
     * @param currentTransaction - to fill in if a transaction is in progress above.
     * If a transaction is defined, the commit and rollback will not be done in this method, it is up to the caller to do it (to avoid double commit or double rollback).
     */
    async addPosts(
        postDtos: PatreonPostDto[],
        patreonCreator: PatreonCreator | number,
        currentTransaction?: QueryRunner,
    ): Promise<PatreonPost[]> {
        // Retrieve the PatreonCreator
        let patreon: PatreonCreator;
        if (patreonCreator instanceof PatreonCreator) {
            patreon = patreonCreator;
        } else {
            patreon = await this.patreonCreatorService.findByCampaignId(patreonCreator);
            if (patreon == null) {
                throw new Error(`Patreon Creator with campaignId : ${patreonCreator} not found.`);
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

        const postSaved: PatreonPost[] = [];
        try {
            for (const postDto of postDtos) {
                const existingPost = await queryRunner.manager.findOne(PatreonPost, postDto.id);
                const isPostExists = existingPost !== undefined;

                const post = new PatreonPost();
                post.id = postDto.id;
                post.creator = Promise.resolve(patreon);
                post.postedAt = postDto.postedAt;
                post.title = postDto.title;
                post.imageUrl = postDto.imageUrl;
                post.contents = postDto.contents;
                post.plainContents = postDto.plainContents;

                if (isPostExists) {
                    await queryRunner.manager.update(PatreonPost, post.id, {
                        postedAt: post.postedAt,
                        title: post.title,
                        imageUrl: post.imageUrl,
                        contents: post.contents,
                        plainContents: post.plainContents,
                    });
                } else {
                    postSaved.push(await queryRunner.manager.save(post));
                }

                // Due to the relations, Attachments and Comments must be created after the Post.
                if (Array.isArray(postDto.attachments) && postDto.attachments.length > 0) {
                    await this.patreonAttachmentService.addAttachments(
                        postDto.attachments,
                        post,
                        queryRunner,
                    );
                }

                if (Array.isArray(postDto.comments) && postDto.comments.length > 0) {
                    await this.patreonCommentService.addComments(
                        postDto.comments,
                        post,
                        queryRunner,
                    );
                }

                if (Array.isArray(postDto.embeds) && postDto.embeds.length > 0) {
                    await this.patreonEmbedService.addEmbeds(postDto.embeds, post, queryRunner);
                }
            }

            // Increment totalPostCount for Creator
            queryRunner.manager.increment(
                Creator,
                {
                    id: (await patreon.creator).id,
                },
                'totalPostCount',
                postSaved.length,
            );

            // Increment totalPostCount for PatreonCreator
            queryRunner.manager.increment(
                PatreonCreator,
                {
                    campaignId: await patreon.campaignId,
                },
                'totalPostCount',
                postSaved.length,
            );

            if (!currentTransaction) {
                await queryRunner.commitTransaction();
            }
        } catch (err) {
            Logger.error(`Failed to add new Patreon Post: ${err}`);
            if (!currentTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw new Error('Failed to add new Patreon Post');
        } finally {
            if (!currentTransaction) await queryRunner.release();
        }

        return postSaved;
    }

    async getPostById(id: number): Promise<PatreonPost> {
        return await this.patreonPostRepository.findOne({ where: { id: id } });
    }

    async getPosts(
        patreonCreator: PatreonCreator | number,
        sortBy: SortBy,
        limit: number,
        skip: number,
    ): Promise<PatreonPost[]> {
        const options: FindManyOptions<PatreonPost> = {};

        if (limit > LimitArg.getPatreonPosts.max) {
            throw new Error(
                `Your "limit" argument exceeds our maxim (${LimitArg.getAllCreators.max})`,
            );
        }

        // Retrieve the PatreonCreator
        if (patreonCreator instanceof PatreonCreator) {
            options.where = { creator: patreonCreator };
        } else {
            const creator = await this.patreonCreatorService.findByCampaignId(patreonCreator);
            if (creator == null) {
                throw new Error(`Patreon Creator with campaingId : ${patreonCreator} not found.`);
            }
            options.where = { creator: creator };
        }

        switch (sortBy) {
            case SortBy.LAST_CREATED:
                options.order = { id: 'DESC' };
                break;

            case SortBy.NAME:
                options.order = { title: 'ASC' };
                break;

            default:
                options.order = { id: 'ASC' };
        }

        options.take = limit;
        options.skip = skip;

        return await this.patreonPostRepository.find(options);
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly PatreonPost['id'][]) {
        return this.patreonPostRepository.find({
            where: { id: In(ids as PatreonPost['id'][]) },
            cache: true,
        });
    }
}
