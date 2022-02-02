import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { PatreonPost } from '../post/post.entity';
import { Creator } from '../../../data/creator/creator.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class PatreonAttachment {
    @Field(() => ID)
    @PrimaryColumn()
    id!: number;

    @ManyToOne(() => Creator, (creator) => creator.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
        cascade: true,
    })
    creator: Promise<Creator>;

    @RelationId((patreonAttachment: PatreonAttachment) => patreonAttachment.creator)
    creatorId: Creator['id'];

    @ManyToOne(() => PatreonPost, (post) => post.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
        cascade: true,
    })
    post: Promise<PatreonPost>;

    @RelationId((patreonAttachment: PatreonAttachment) => patreonAttachment.post)
    postId: PatreonPost['id'];

    @Field()
    @Column()
    displayName: string;

    @Field()
    @Column()
    filename: string;
}
