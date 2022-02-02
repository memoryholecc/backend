import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from 'typeorm';
import { PatreonCreator } from '../../sites/Patreon/creator/patreonCreator.entity';
import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Creator {
    @Field(() => ID, { nullable: false })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column()
    @Index()
    name!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    profilePicture?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    bannerPicture?: string;

    @Field(() => [PatreonCreator], { nullable: true })
    @OneToMany(() => PatreonCreator, (patreonCreator) => patreonCreator.creator, {
        cascade: false,
        lazy: true,
    })
    patreon?: Promise<PatreonCreator[]>;

    // @RelationId((creator: Creator) => creator.patreon)
    // patreonIds: PatreonCreator['campaignId'][];

    @Field(() => Int, { defaultValue: 0 })
    @Column({ default: 0 })
    totalPostCount: number;

    @Field(() => GraphQLISODateTime)
    @UpdateDateColumn()
    lastUpdated: Date;

    @Field(() => GraphQLISODateTime)
    @CreateDateColumn()
    created: Date;
}
