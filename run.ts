import {promisify} from 'util';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import {Result, JSMetadata} from './json';

const exec = promisify(childProcess.exec);

interface Tool {
    name: string,
    run: (inpath: string, outpath: string) => Promise<void>;
}

const tools: Tool[] = [
    {name:'raw', run:raw},
    {name:'uglify', run: (inp, out) => uglify("", inp, out)},
    {name:'uglify-compress-mangle', run: (inp, out) => uglify("--compress --mangle", inp, out)},
    {name:'closure', run: (inp, out) => closure("", inp, out)},
    // {name:'dec', run: (inp, out) => dec(inp, out)},
];

async function raw(inpath: string, outpath: string) {
    await exec(`cp ${inpath} ${outpath}`);
}

async function uglify(flags: string, inpath: string, outpath: string) {
    await exec(`node_modules/.bin/uglifyjs ${inpath} -o ${outpath} ${flags}`);
}

async function closure(flags: string, inpath: string, outpath: string) {
    await exec(`java -jar node_modules/google-closure-compiler/compiler.jar ${flags} --js_output_file=${outpath} ${inpath}`);
}

async function dec(inpath: string, outpath: string) {
    await exec(`../target/release/js ${inpath} > ${outpath}`);
}

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

    let jsMetadata = JSON.parse(fs.readFileSync('js/metadata.json', 'utf8'));
    let inputs = Object.keys(jsMetadata);
    inputs.sort();

    let results: Result[] = [];
    for (const input of inputs) {
        for (const {name:tool, run} of tools) {
            console.log(`${input} ${tool}`);
            let out = `out/${tool}.${input}`;
            let start = Date.now();
            await run(`js/${input}`, out);
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

    summarize(results);
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
});
