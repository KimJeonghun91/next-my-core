import { RSC_PREFETCH_SUFFIX } from '../../../../lib/constants';
import { SuffixPathnameNormalizer } from './suffix';
export class PrefetchRSCPathnameNormalizer extends SuffixPathnameNormalizer {
    constructor() {
        super(RSC_PREFETCH_SUFFIX);
    }
}
