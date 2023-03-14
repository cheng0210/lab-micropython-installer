import { exec } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export class Flasher {

    async runDfuUtil(firmwareFilepath, vendorId, productId, reset = true) {
        const binaryFolder = os.platform();
        const scriptDir = path.dirname(__filename);
        const dfuUtilPath = path.join(scriptDir, "..", "bin", binaryFolder, "dfu-util");

        // Specify the altsetting of the DFU interface via -a.
        let cmd = `${dfuUtilPath} -a 0 -d ${vendorId}:${productId} -D ${firmwareFilepath}`;
        
        // In theory, the reset should be automatic, but it doesn't seem to work
        // The -s :leave is a workaround but requires the memory address to be specified
        if (reset) {
            cmd += " -R";
        }

        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error running dfu-util: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Error running dfu-util: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    }

    async runBossac(firmwareFilepath, port = null, offset = null) {
        const folder = os.platform();
        const scriptDir = path.dirname(__filename);
        const bossacPath = path.join(scriptDir, "..", "bin", folder, "bossac");

        let cmd = `${bossacPath} -i -d -e -w -R`;
        
        // In theory, the port should be automatically detected, but it doesn't seem to work
        if (port) {
            cmd += ` -U --port=${port}`;
        }
        if (offset) {
            cmd += ` --offset=${offset}`;
        }
        cmd += ` ${firmwareFilepath}`;

        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error running bossac: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Error running bossac: ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    }

}

export default Flasher;