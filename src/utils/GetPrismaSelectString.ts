import { PrismaSelect } from '@paljs/plugins';
import { GraphQLResolveInfo } from 'graphql';

export function getPrismaSelectString(info?: GraphQLResolveInfo): any {
    if (!info) return {};
    return new PrismaSelect(info).value ?? {};
}
