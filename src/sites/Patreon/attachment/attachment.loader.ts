import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/utils/dataloader';
import { PatreonAttachment } from './attachment.entity';
import { PatreonAttachmentService } from './attachment.service';

@Injectable({ scope: Scope.REQUEST })
export class PatreonAttachmentLoader extends OrderedNestDataLoader<
    PatreonAttachment['id'],
    PatreonAttachment
> {
    constructor(private readonly patreonAttachmentService: PatreonAttachmentService) {
        super();
    }

    protected getOptions = () => ({
        query: (keys: PatreonAttachment['id'][]) => this.patreonAttachmentService.findByIds(keys),
    });
}
