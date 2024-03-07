export class ServerManifestLoader {
    constructor(getter) {
        this.getter = getter;
    }
    load(name) {
        return this.getter(name);
    }
}
