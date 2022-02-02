import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { PatreonPost } from './post.entity';
import { PatreonPostService } from './post.service';

@Injectable({ scope: Scope.REQUEST })
export class PatreonPostLoader extends OrderedNestDataLoader<PatreonPost['id'], PatreonPost> {
    constructor(private readonly patreonPostService: PatreonPostService) {
        super();
    }

    protected getOptions = () => ({
        query: (keys: PatreonPost['id'][]) => this.patreonPostService.findByIds(keys),
    });
}
