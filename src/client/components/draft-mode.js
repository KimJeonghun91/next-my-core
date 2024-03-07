import { staticGenerationBailout } from './static-generation-bailout';
export class DraftMode {
    constructor(provider) {
        this._provider = provider;
    }
    get isEnabled() {
        return this._provider.isEnabled;
    }
    enable() {
        if (staticGenerationBailout('draftMode().enable()')) {
            return;
        }
        return this._provider.enable();
    }
    disable() {
        if (staticGenerationBailout('draftMode().disable()')) {
            return;
        }
        return this._provider.disable();
    }
}
