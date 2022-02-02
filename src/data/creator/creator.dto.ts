import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatorDto {
    @Field()
    @IsString()
    @IsNotEmpty()
    name!: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    profilePicture?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    bannerPicture?: string;
}
