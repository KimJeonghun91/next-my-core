import RefreshHelpers from './internal/helpers';
export type RefreshRuntimeGlobals = {
    $RefreshReg$: (type: unknown, id: string) => void;
    $RefreshSig$: () => (type: unknown) => unknown;
    $RefreshInterceptModuleExecution$: (moduleId: string) => () => void;
    $RefreshHelpers$: typeof RefreshHelpers;
};
