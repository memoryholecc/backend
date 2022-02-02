import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';
import { PatreonComment } from '../comment/comment.entity';
import { PatreonCreator } from '../creator/patreonCreator.entity';
import { PatreonAttachment } from '../attachment/attachment.entity';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { PatreonEmbed } from '../embed/embed.entity';

@ObjectType()
@Entity()
export class PatreonPost {
    @Field(() => ID)
    @PrimaryColumn()
    id!: number;

    // For future reference, this should be <platform>Creator.
    // This is to prevent confusion between the <Platform>Creator (Ie: PatreonCreator) and the Creator (Our global creator).
    @ManyToOne(() => PatreonCreator, (patreonCreator) => patreonCreator.posts, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
        cascade: true,
        nullable: false,
    })
    creator: Promise<PatreonCreator>;

    @RelationId((patreonPost: PatreonPost) => patreonPost.creator)
    creatorId: PatreonCreator['campaignId'];

    @Field(() => GraphQLISODateTime)
    @Column()
    postedAt: Date;

    @Field()
    @Column()
    title!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl?: string;

    @Field()
    @Column({ type: 'text' })
    contents!: string;

    @Field()
    @Column({ type: 'text' })
    plainContents!: string;

    @Field(() => [PatreonAttachment], { defaultValue: [] })
    @OneToMany(() => PatreonAttachment, (attachment) => attachment.post, {
        lazy: true,
    })
    attachments: Promise<PatreonAttachment[]>;

    @RelationId((patreonPost: PatreonPost) => patreonPost.attachments)
    attachmentIds: PatreonAttachment['id'][];

    @Field(() => [PatreonComment], { defaultValue: [] })
    @OneToMany(() => PatreonComment, (comment) => comment.post, {
        lazy: true,
    })
    comments: Promise<PatreonComment[]>;

    @RelationId((patreonPost: PatreonPost) => patreonPost.comments)
    commentIds: PatreonComment['id'][];

    @Field(() => [PatreonEmbed], { defaultValue: [] })
    @OneToMany(() => PatreonEmbed, (embed) => embed.post, {
        lazy: true,
    })
    embeds: Promise<PatreonEmbed[]>;

    @RelationId((patreonPost: PatreonPost) => patreonPost.embeds)
    embedIds: PatreonEmbed['id'][];
}
