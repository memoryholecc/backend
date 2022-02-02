import { Module } from '@nestjs/common';
import { PatreonModule } from './Patreon/patreon.module';

@Module({
    imports: [PatreonModule],
    exports: [PatreonModule],
})
export class SitesModule {}
