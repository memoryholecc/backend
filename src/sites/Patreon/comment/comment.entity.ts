import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { PatreonPost } from '../post/post.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class PatreonComment {
    @Field(() => ID)
    @PrimaryColumn()
    id: number;

    @ManyToOne(() => PatreonPost, (post) => post.comments, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
    })
    post: Promise<PatreonPost>;

    @RelationId((patreonComment: PatreonComment) => patreonComment.post)
    postId: PatreonPost['id'];

    @ManyToOne(() => PatreonComment, (comment) => comment.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        nullable: true,
    })
    parentId?: number;

    @Field()
    @Column()
    authorUsername: string;

    @Field()
    @Column({ nullable: true })
    authorPicture?: string;

    @Field()
    @Column({ nullable: true })
    authorUrl?: string;

    @Field()
    @Column()
    postedAt: Date;

    @Field()
    @Column({ type: 'text' })
    contents: string;
}
