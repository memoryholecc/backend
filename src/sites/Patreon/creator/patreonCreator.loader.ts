import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { PatreonCreator } from './patreonCreator.entity';
import { PatreonCreatorService } from './patreonCreator.service';

@Injectable({ scope: Scope.REQUEST })
export class PatreonCreatorLoader extends OrderedNestDataLoader<
    PatreonCreator['campaignId'],
    PatreonCreator
> {
    constructor(private readonly patreonCreatorService: PatreonCreatorService) {
        super();
    }

    protected getOptions = () => ({
        propertyKey: 'campaignId',
        query: (keys: PatreonCreator['campaignId'][]) => this.patreonCreatorService.findByIds(keys),
    });
}
