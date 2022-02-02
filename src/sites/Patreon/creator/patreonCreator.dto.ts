import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

@InputType()
export class PatreonCreatorDto {
    @Field(() => ID)
    @IsNumberString()
    campaignId: number;

    @Field()
    @IsString()
    @IsNotEmpty()
    username: string;

    /*
     * WARNING: Importing posts when creating the Patreon Creator has the risk of running
     * across request size limits, which will cause the request to fail before starting.
     */
    /* This does not work at the moment.
    @Field(() => [PatreonPostDto], { nullable: true })
    @IsOptional()
    @ArrayNotEmpty()
    @ValidateNested()
    posts?: PatreonPostDto[];
    */
}
