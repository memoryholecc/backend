import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { PatreonComment } from './comment.entity';
import { PatreonCommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class PatreonCommentLoader extends OrderedNestDataLoader<
    PatreonComment['id'],
    PatreonComment
> {
    constructor(private readonly patreonCommentService: PatreonCommentService) {
        super();
    }

    protected getOptions = () => ({
        query: (keys: PatreonComment['id'][]) => this.patreonCommentService.findByIds(keys),
    });
}
