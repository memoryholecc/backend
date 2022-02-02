import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { Creator } from './creator.entity';
import { CreatorService } from './creator.service';

@Injectable({ scope: Scope.REQUEST })
export class CreatorLoader extends OrderedNestDataLoader<Creator['id'], Creator> {
    constructor(private readonly creatorService: CreatorService) {
        super();
    }

    protected getOptions = () => ({
        query: (keys: Creator['id'][]) => this.creatorService.findByIds(keys),
    });
}
