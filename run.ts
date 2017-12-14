import {promisify} from 'util';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import {Result} from './json';
import * as metadata from './metadata';

const exec = promisify(childProcess.exec);

async function gzip(path: string) {
    await exec(`gzip -k -9 -f ${path}`);
}

async function summarize(results: Result[]) {
    await promisify(fs.writeFile)('results.json', JSON.stringify(results));
}

async function main() {
    try {
        fs.mkdirSync('out');
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }

    let inputs = Object.keys(metadata.js);
    inputs.sort();

    let results: Result[] = [];
    for (const input of inputs) {
        const inputPath = metadata.js[input].path;
        for (const {name:tool, command} of metadata.tools) {
            console.log(`${input} ${tool}`);
            let out = `out/${tool}.${input}`;
            let cmd = command.replace('%%in%%', inputPath)
                .replace('%%out%%', out);
            let start = Date.now();
            try {
                await exec(cmd);
            } catch (e) {
                let end = Date.now();
                results.push({
                    input,
                    tool,
                    time: end - start,
                    size: 0,
                    gzSize: 0,
                    failed: true,
                });
                continue;
            }
            let end = Date.now();
            let size = fs.statSync(out).size;
            await gzip(out);
            let gzSize = fs.statSync(`${out}.gz`).size;

            results.push({
                input,
                tool,
                time: end - start,
                size,
                gzSize,
            });
        }
    }

    await summarize(results);
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
});
