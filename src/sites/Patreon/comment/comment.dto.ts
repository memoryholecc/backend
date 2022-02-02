import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

@InputType()
export class PatreonCommentDto {
    @Field(() => ID)
    @IsNumberString()
    id: number;

    @Field()
    @IsString()
    @IsNotEmpty()
    authorUsername: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    authorPicture?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    authorUrl?: string;

    @Field()
    @IsDate()
    @IsNotEmpty()
    postedAt: Date;

    @Field()
    @IsString()
    @IsNotEmpty()
    contents: string;
}
