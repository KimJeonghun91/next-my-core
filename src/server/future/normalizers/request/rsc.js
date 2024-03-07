import { RSC_SUFFIX } from '../../../../lib/constants';
import { SuffixPathnameNormalizer } from './suffix';
export class RSCPathnameNormalizer extends SuffixPathnameNormalizer {
    constructor() {
        super(RSC_SUFFIX);
    }
}
