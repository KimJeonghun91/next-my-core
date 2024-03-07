// source: https://github.com/sindresorhus/fnv1a
// FNV_PRIMES and FNV_OFFSETS from
// http://www.isthe.com/chongo/tech/comp/fnv/index.html#FNV-param
/* eslint-disable @typescript-eslint/no-loss-of-precision */
const FNV_PRIMES = {
    32: BigInt(16777619),
    64: BigInt(1099511628211),
    128: BigInt(3.094850098213451e+26),
    256: BigInt(3.7414441915671115e+50),
    512: BigInt(3.583591587484487e+103),
    1024: BigInt(5.016456510113119e+204),
};
const FNV_OFFSETS = {
    32: BigInt(2166136261),
    64: BigInt(14695981039346655000),
    128: BigInt(1.4406626329776981e+38),
    256: BigInt(1.0002925795805258e+77),
    512: BigInt(9.65930312949667e+153),
    1024: BigInt(1.419779506494762e+286),
};
export default function fnv1a(inputString, { size = 32, seed = 0, } = {}) {
    if (!FNV_PRIMES[size]) {
        throw new Error('The `size` option must be one of 32, 64, 128, 256, 512, or 1024');
    }
    let hash = FNV_OFFSETS[size] ^ BigInt(seed);
    const fnvPrime = FNV_PRIMES[size];
    // Handle Unicode code points > 0x7f
    let isUnicoded = false;
    for (let index = 0; index < inputString.length; index++) {
        let characterCode = inputString.charCodeAt(index);
        // Non-ASCII characters trigger the Unicode escape logic
        if (characterCode > 0x7f && !isUnicoded) {
            inputString = unescape(encodeURIComponent(inputString));
            characterCode = inputString.charCodeAt(index);
            isUnicoded = true;
        }
        hash ^= BigInt(characterCode);
        hash = BigInt.asUintN(size, hash * fnvPrime);
    }
    return hash;
}
