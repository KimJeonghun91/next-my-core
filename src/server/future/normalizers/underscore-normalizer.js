/**
 * UnderscoreNormalizer replaces all instances of %5F with _.
 */
export class UnderscoreNormalizer {
    normalize(pathname) {
        return pathname.replace(/%5F/g, '_');
    }
}
