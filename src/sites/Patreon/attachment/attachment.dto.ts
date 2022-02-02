import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

@InputType()
export class PatreonAttachmentDto {
    @Field(() => ID)
    @IsNumberString()
    id!: number;

    @Field()
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    filename: string;
}
