import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class PatreonEmbedDto {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    subject?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    provider?: string;

    @Field()
    @IsUrl()
    url?: string;
}
