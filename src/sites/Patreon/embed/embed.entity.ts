import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PatreonPost } from '../post/post.entity';

@ObjectType()
@Entity()
export class PatreonEmbed {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => PatreonPost, (post) => post.id, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        lazy: true,
        cascade: true,
    })
    post: Promise<PatreonPost>;

    @RelationId((patreonEmbed: PatreonEmbed) => patreonEmbed.post)
    postId: PatreonPost['id'];

    @Field({ nullable: true })
    @Column({ nullable: true })
    subject?: string;

    @Field({ nullable: true })
    @Column({ nullable: true, type: 'longtext' })
    description?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    provider?: string;

    @Field()
    @Column()
    url: string;
}
