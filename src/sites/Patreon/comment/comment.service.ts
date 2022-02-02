import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, QueryRunner, Repository } from 'typeorm';
import { PatreonPost } from '../post/post.entity';
import { PatreonComment } from './comment.entity';
import { ModuleRef } from '@nestjs/core';
import { PatreonCommentDto } from './comment.dto';
import { PatreonPostService } from '../post/post.service';

@Injectable()
export class PatreonCommentService {
    constructor(
        @InjectRepository(PatreonComment)
        private readonly patreonCommentRepository: Repository<PatreonComment>,
        @Inject(forwardRef(() => PatreonPostService))
        private readonly patreonPostService: PatreonPostService,
        private readonly moduleRef: ModuleRef,
    ) {}

    /**
     *
     * @param commentDtos - comments to add
     * @param patreonPost - patreon campaign ID OR PatreonPost entity
     * @param currentTransaction - to fill in if a transaction is in progress above.
     * If a transaction is defined, the commit and rollback will not be done in this method, it is up to the caller to do it (to avoid double commit or double rollback).
     */
    async addComments(
        commentDtos: PatreonCommentDto[],
        patreonPost: PatreonPost | number,
        currentTransaction?: QueryRunner,
    ): Promise<PatreonComment[]> {
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

        const commentSaved: PatreonComment[] = [];
        try {
            for (const commentDto of commentDtos) {
                const existingComment = await queryRunner.manager.findOne(
                    PatreonComment,
                    commentDto.id,
                );
                const isCommentExists = existingComment !== undefined;

                if (isCommentExists) {
                    await queryRunner.manager.update(PatreonComment, commentDto.id, {
                        postedAt: commentDto.postedAt,
                        contents: commentDto.contents,
                        authorUrl: commentDto.authorUrl,
                        authorPicture: commentDto.authorPicture,
                        authorUsername: commentDto.authorUsername,
                    });
                } else {
                    const comment = new PatreonComment();
                    comment.id = commentDto.id;
                    comment.post = Promise.resolve(post);
                    comment.postedAt = commentDto.postedAt;
                    comment.contents = commentDto.contents;
                    comment.authorUrl = commentDto.authorUrl;
                    comment.authorPicture = commentDto.authorPicture;
                    comment.authorUsername = commentDto.authorUsername;

                    commentSaved.push(await queryRunner.manager.save(comment));
                }
            }
            if (!currentTransaction) {
                await queryRunner.commitTransaction();
            }
        } catch (err) {
            Logger.error(`Failed to add new Patreon Comment: ${err}`);
            if (!currentTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw new Error('Failed to add new Patreon Comment');
        } finally {
            if (!currentTransaction) await queryRunner.release();
        }

        return commentSaved;
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly PatreonComment['id'][]) {
        return this.patreonCommentRepository.find({
            where: { id: In(ids as PatreonComment['id'][]) },
            cache: true,
        });
    }
}
