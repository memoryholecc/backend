/***
 * This is a dataloader implementation based upon krislefeber/nestjs-dataloader
 * and TreeMan360/nestjs-graphql-dataloader.
 *
 * We applied PRs #21 and #51 to the nestjs-dataloader package and made additional
 * fixes and changes to fit our needs.
 *
 * The original packages have not been updated with support for NestJS 8 and
 * have been abandoned by the original developers.
 */

import {
    CallHandler,
    createParamDecorator,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import * as DataLoader from 'dataloader';
import { Observable } from 'rxjs';

/**
 * This interface will be used to generate the initial data loader.
 * The concrete implementation should be added as a provider to your module.
 */
export interface NestDataLoader<ID, Type> {
    /**
     * Should return a new instance of dataloader each time
     */
    generateDataLoader(): DataLoader<ID, Type>;
}

/**
 * Context key where get loader function will be stored.
 * This class should be added to your module providers like so:
 * {
 *     provide: APP_INTERCEPTOR,
 *     useClass: DataLoaderInterceptor,
 * },
 */
const NEST_LOADER_CONTEXT_KEY = 'NEST_LOADER_CONTEXT_KEY';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
    constructor(private readonly moduleRef: ModuleRef) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType<GqlContextType>() !== 'graphql') {
            return next.handle();
        }

        const ctx = GqlExecutionContext.create(context).getContext();

        if (ctx && ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
            ctx[NEST_LOADER_CONTEXT_KEY] = {
                contextId: ContextIdFactory.create(),
                getLoader: (type: string): Promise<NestDataLoader<any, any>> => {
                    if (ctx[type] === undefined) {
                        try {
                            ctx[type] = (async () => {
                                return (
                                    await this.moduleRef.resolve<NestDataLoader<any, any>>(
                                        type,
                                        ctx[NEST_LOADER_CONTEXT_KEY].contextId,
                                        { strict: false },
                                    )
                                ).generateDataLoader();
                            })();
                        } catch (e) {
                            throw new InternalServerErrorException(
                                `The loader ${type} is not provided: ` + e,
                            );
                        }
                    }
                    return ctx[type];
                },
            };
        }
        return next.handle();
    }
}

/**
 * The decorator to be used within your graphql method.
 */
export const Loader = createParamDecorator(
    // eslint-disable-next-line @typescript-eslint/ban-types
    async (data: Function, context: ExecutionContext & { [key: string]: any }) => {
        if (!data) {
            throw new InternalServerErrorException(`No loader provided to @Loader ('${data}')`);
        }

        if (context.getType<GqlContextType>() !== 'graphql') {
            throw new InternalServerErrorException(
                '@Loader should only be used within the GraphQL context',
            );
        }

        const ctx: any = GqlExecutionContext.create(context).getContext();
        if (!ctx[NEST_LOADER_CONTEXT_KEY]) {
            throw new InternalServerErrorException(`
            You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
          `);
        }
        return await ctx[NEST_LOADER_CONTEXT_KEY].getLoader(data);
    },
);

// https://github.com/graphql/dataloader/issues/66#issuecomment-386252044
export const ensureOrder = (options) => {
    const { docs, keys, prop, error = (key) => `Document does not exist (${key})` } = options;
    // Put documents (docs) into a map where key is a document's ID or some
    // property (prop) of a document and value is a document.
    const docsMap = new Map();
    docs.forEach((doc) => docsMap.set(doc[prop], doc));
    // Loop through the keys and for each one retrieve proper document. For not
    // existing documents generate an error.
    return keys.map((key) => {
        return docsMap.get(key) || new Error(typeof error === 'function' ? error(key) : error);
    });
};

interface IOrderedNestDataLoaderOptions<ID, Type> {
    propertyKey?: string;
    query: (keys: readonly ID[]) => Promise<Type[]>;
    typeName?: string;
    dataloaderConfig?: DataLoader.Options<ID, Type>;
}

export abstract class OrderedNestDataLoader<ID, Type> implements NestDataLoader<ID, Type> {
    protected abstract getOptions: () => IOrderedNestDataLoaderOptions<ID, Type>;

    public generateDataLoader() {
        return this.createLoader(this.getOptions());
    }

    protected createLoader(options: IOrderedNestDataLoaderOptions<ID, Type>): DataLoader<ID, Type> {
        const defaultTypeName = this.constructor.name.replace('Loader', '');
        return new DataLoader<ID, Type>(async (keys) => {
            return ensureOrder({
                docs: await options.query(keys),
                keys,
                prop: options.propertyKey || 'id',
                error: (keyValue) =>
                    `${options.typeName || defaultTypeName} does not exist (${keyValue})`,
            });
        }, options.dataloaderConfig);
    }
}
