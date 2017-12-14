import {promisify} from 'util';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import {Result, JSMetadata, ToolsMetadata} from './json';

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

    let jsMetadata: JSMetadata = JSON.parse(fs.readFileSync('js/metadata.json', 'utf8'));
    let inputs = Object.keys(jsMetadata);
    inputs.sort();

    let tools: ToolsMetadata = JSON.parse(fs.readFileSync('tools.json', 'utf8'));

    let results: Result[] = [];
    for (const input of inputs) {
        for (const {name:tool, command} of tools) {
            console.log(`${input} ${tool}`);
            let out = `out/${tool}.${input}`;
            let cmd = command.replace('%%in%%', `js/${input}`)
                .replace('%%out%%', out);
            let start = Date.now();
            await exec(cmd);
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
