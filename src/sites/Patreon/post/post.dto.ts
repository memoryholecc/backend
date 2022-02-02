import {
    ArrayNotEmpty,
    IsDate,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { PatreonCommentDto } from '../comment/comment.dto';
import { PatreonAttachmentDto } from '../attachment/attachment.dto';
import { PatreonEmbedDto } from '../embed/embed.dto';

@InputType()
export class PatreonPostDto {
    @Field(() => Int)
    @IsNumberString()
    id: number;

    @Field()
    @IsDate()
    postedAt: Date;

    @Field()
    @IsString()
    @IsNotEmpty()
    title!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    imageUrl?: string;

    @Field()
    @IsString()
    contents: string;

    @Field()
    @IsString()
    plainContents: string;

    @Field(() => [PatreonAttachmentDto], { nullable: true })
    @IsOptional()
    @ArrayNotEmpty()
    @ValidateNested()
    attachments?: PatreonAttachmentDto[];

    @Field(() => [PatreonCommentDto], { nullable: true })
    @IsOptional()
    @ArrayNotEmpty()
    @ValidateNested()
    comments?: PatreonCommentDto[];

    @Field(() => [PatreonEmbedDto], { nullable: true })
    @IsOptional()
    @ArrayNotEmpty()
    @ValidateNested()
    embeds?: PatreonEmbedDto[];
}
