import { SERVER_RUNTIME } from './constants';
export function isEdgeRuntime(value) {
    return (value === SERVER_RUNTIME.experimentalEdge || value === SERVER_RUNTIME.edge);
}
