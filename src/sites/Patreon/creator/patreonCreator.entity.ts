import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';
import { Creator } from '../../../data/creator/creator.entity';
import { PatreonPost } from '../post/post.entity';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class PatreonCreator {
    @Field(() => ID)
    @PrimaryColumn()
    campaignId!: number;

    @ManyToOne(() => Creator, (creator) => creator.patreon, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
        cascade: true,
    })
    creator: Promise<Creator>;

    @RelationId((patreonCreator: PatreonCreator) => patreonCreator.creator)
    creatorId: Creator['id'];

    @Field()
    @Column()
    username: string;

    @Field(() => [PatreonPost], { defaultValue: [] })
    @OneToMany(() => PatreonPost, (post) => post.creator, {
        lazy: true,
    })
    posts: Promise<PatreonPost[]>;

    @RelationId((patreonCreator: PatreonCreator) => patreonCreator.posts)
    postIds: PatreonPost['id'][];

    @Field(() => Int)
    @Column()
    totalPostCount: number;
}
