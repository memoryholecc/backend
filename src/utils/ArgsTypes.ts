import { registerEnumType } from '@nestjs/graphql';
import { env } from './env';

export enum SortBy {
    LAST_CREATED,
    LAST_UPDATED,
    NAME,
}

export const LimitArg = {
    // Applies to getAllCreators, getCreatorsByIds, and searchCreatorByName
    getAllCreators: {
        default: 25,
        max: env.ENV === 'production' ? 25 : 200,
    },
    // Applies to both getAllPatreon and searchPatreonByName
    getAllPatreon: {
        default: 25,
        max: env.ENV === 'production' ? 25 : 200,
    },
    // Applies to getPatreonPosts
    getPatreonPosts: {
        default: 50,
        max: env.ENV === 'production' ? 50 : 200,
    },
};

registerEnumType(SortBy, {
    name: 'sortBy',
    valuesMap: {
        LAST_CREATED: {
            description: 'Sort by newest (DESC)',
        },
        /*
        LAST_POST: {
            description: 'Sort by post.postedAt (DESC)',
        },
        */
        LAST_UPDATED: {
            description: 'Sort by last updated (DESC)',
        },
        NAME: {
            description: 'Sort by name (ASC)',
        },
    },
});
