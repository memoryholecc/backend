import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, QueryRunner, Repository } from 'typeorm';
import { PatreonPost } from '../post/post.entity';
import { ModuleRef } from '@nestjs/core';
import { PatreonPostService } from '../post/post.service';
import { PatreonEmbed } from './embed.entity';
import { PatreonEmbedDto } from './embed.dto';

@Injectable()
export class PatreonEmbedService {
    constructor(
        @InjectRepository(PatreonEmbed)
        private readonly patreonEmbedRepository: Repository<PatreonEmbed>,
        @Inject(forwardRef(() => PatreonPostService))
        private readonly patreonPostService: PatreonPostService,
        private readonly moduleRef: ModuleRef,
    ) {}

    /**
     *
     * @param embedDtos - embeds to add
     * @param patreonPost - patreon campaign ID OR PatreonPost entity
     * @param currentTransaction - to fill in if a transaction is in progress above.
     * If a transaction is defined, the commit and rollback will not be done in this method, it is up to the caller to do it (to avoid double commit or double rollback).
     */
    async addEmbeds(
        embedDtos: PatreonEmbedDto[],
        patreonPost: PatreonPost | number,
        currentTransaction?: QueryRunner,
    ): Promise<PatreonEmbed[]> {
        // Retrieve the PatreonCreator
        let post: PatreonPost;
        if (patreonPost instanceof PatreonPost) {
            post = patreonPost;
        } else {
            post = await this.patreonPostService.getPostById(patreonPost);
            if (post == null) {
                throw new Error(`Patreon Post with id : ${patreonPost} not found.`);
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

        const embedSaved: PatreonEmbed[] = [];
        try {
            for (const embedDto of embedDtos) {
                // Embeds do not have IDs, so this checks if an identical embed exists.
                const existingEmbed = await queryRunner.manager.findOne(PatreonEmbed, {
                    where: {
                        post: post,
                        provider: embedDto.provider,
                        url: embedDto.url,
                    },
                });
                const isEmbedExists = existingEmbed !== undefined;

                if (isEmbedExists) {
                    await queryRunner.manager.update(PatreonEmbed, existingEmbed.id, {
                        subject: embedDto.subject,
                        description: embedDto.description,
                    });
                } else {
                    const embed = new PatreonEmbed();
                    embed.post = Promise.resolve(post);
                    embed.provider = embedDto.provider;
                    embed.subject = embedDto.subject;
                    embed.description = embedDto.description;
                    embed.url = embedDto.url;

                    embedSaved.push(await queryRunner.manager.save(embed));
                }
            }
            if (!currentTransaction) {
                await queryRunner.commitTransaction();
            }
        } catch (err) {
            Logger.error(`Failed to add new Patreon embed: ${err}`);
            if (!currentTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw new Error('Failed to add new Patreon embed');
        } finally {
            if (!currentTransaction) await queryRunner.release();
        }

        return embedSaved;
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly PatreonEmbed['id'][]) {
        return this.patreonEmbedRepository.find({
            where: { id: In(ids as PatreonEmbed['id'][]) },
            cache: true,
        });
    }
}
