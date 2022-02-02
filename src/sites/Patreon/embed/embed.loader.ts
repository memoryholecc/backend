import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { PatreonEmbed } from './embed.entity';
import { PatreonEmbedService } from './embed.service';

@Injectable({ scope: Scope.REQUEST })
export class PatreonEmbedLoader extends OrderedNestDataLoader<PatreonEmbed['id'], PatreonEmbed> {
    constructor(private readonly patreonEmbedService: PatreonEmbedService) {
        super();
    }

    protected getOptions = () => ({
        query: (keys: PatreonEmbed['id'][]) => this.patreonEmbedService.findByIds(keys),
    });
}
