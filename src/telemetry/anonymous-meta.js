import isDockerFunction from 'next/dist/compiled/is-docker';
import isWslBoolean from 'next/dist/compiled/is-wsl';
import os from 'os';
import * as ciEnvironment from './ci-info';
let traits;
export function getAnonymousMeta() {
    if (traits) {
        return traits;
    }
    const cpus = os.cpus() || [];
    const { NOW_REGION } = process.env;
    traits = {
        // Software information
        systemPlatform: os.platform(),
        systemRelease: os.release(),
        systemArchitecture: os.arch(),
        // Machine information
        cpuCount: cpus.length,
        cpuModel: cpus.length ? cpus[0].model : null,
        cpuSpeed: cpus.length ? cpus[0].speed : null,
        memoryInMb: Math.trunc(os.totalmem() / Math.pow(1024, 2)),
        // Environment information
        isDocker: isDockerFunction(),
        isNowDev: NOW_REGION === 'dev1',
        isWsl: isWslBoolean,
        isCI: ciEnvironment.isCI,
        ciName: (ciEnvironment.isCI && ciEnvironment.name) || null,
        nextVersion: process.env.__NEXT_VERSION,
    };
    return traits;
}
