export function isClientReference(reference) {
    return (reference === null || reference === void 0 ? void 0 : reference.$$typeof) === Symbol.for('react.client.reference');
}
