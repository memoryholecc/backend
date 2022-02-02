import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, In, QueryRunner, Repository } from 'typeorm';
import { PatreonPost } from '../post/post.entity';
import { ModuleRef } from '@nestjs/core';
import { PatreonPostService } from '../post/post.service';
import { PatreonAttachment } from './attachment.entity';
import { PatreonAttachmentDto } from './attachment.dto';

@Injectable()
export class PatreonAttachmentService {
    constructor(
        @InjectRepository(PatreonAttachment)
        private readonly patreonAttachmentRepository: Repository<PatreonAttachment>,
        @Inject(forwardRef(() => PatreonPostService))
        private readonly patreonPostService: PatreonPostService,
        private readonly moduleRef: ModuleRef,
    ) {}

    /**
     *
     * @param attachmentDtos - attachments to add
     * @param patreonPost - patreon campaign ID OR PatreonPost entity
     * @param currentTransaction - to fill in if a transaction is in progress above.
     * If a transaction is defined, the commit and rollback will not be done in this method, it is up to the caller to do it (to avoid double commit or double rollback).
     */
    async addAttachments(
        attachmentDtos: PatreonAttachmentDto[],
        patreonPost: PatreonPost | number,
        currentTransaction?: QueryRunner,
    ): Promise<PatreonAttachment[]> {
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

        const attachmentSaved: PatreonAttachment[] = [];
        try {
            for (const attachmentDto of attachmentDtos) {
                const existingAttachment = await queryRunner.manager.findOne(
                    PatreonAttachment,
                    attachmentDto.id,
                );
                const isAttachmentExists = existingAttachment !== undefined;

                if (isAttachmentExists) {
                    await queryRunner.manager.update(PatreonAttachment, attachmentDto.id, {
                        filename: attachmentDto.filename,
                        displayName: attachmentDto.displayName,
                    });
                } else {
                    const attachment = new PatreonAttachment();
                    attachment.id = attachmentDto.id;
                    attachment.filename = attachmentDto.filename;
                    attachment.displayName = attachmentDto.displayName;
                    attachment.post = Promise.resolve(post);
                    attachment.creator = (await post.creator).creator; // This looks hideous.

                    attachmentSaved.push(await queryRunner.manager.save(attachment));
                }
            }
            if (!currentTransaction) {
                await queryRunner.commitTransaction();
            }
        } catch (err) {
            Logger.error(`Failed to add new Patreon Attachment: ${err}`);
            if (!currentTransaction) {
                await queryRunner.rollbackTransaction();
            }
            throw new Error('Failed to add new Patreon Attachment');
        } finally {
            if (!currentTransaction) await queryRunner.release();
        }

        return attachmentSaved;
    }

    // This is used by the dataloader and should not be changed.
    async findByIds(ids: readonly PatreonAttachment['id'][]) {
        return this.patreonAttachmentRepository.find({
            where: { id: In(ids as PatreonAttachment['id'][]) },
            cache: true,
        });
    }
}
