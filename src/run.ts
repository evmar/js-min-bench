/**
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as childProcess from 'child_process';
import {Result} from './json';
import * as metadata from './metadata';
import * as commander from 'commander';
import * as Mocha from 'mocha';
import {WebServer} from './web_server';

/**
 * The mocha typings are missing the 'unloadFiles' method,
 * which is needed so we can run the same test suite against multiple
 * different bundle configurations.
 */
declare global {
  interface Mocha {
    unloadFiles(): void;
  }
}

/** Synchronously executes a subcommand. */
function exec(cmd: string) {
  childProcess.execSync(cmd, {stdio: 'inherit'});
}

/** gzips a bundle and returns the gzipped size. */
function gzip(path: string): number {
  exec(`gzip -k -9 -f ${path}`);
  return fs.statSync(`${path}.gz`).size;
}

/** brotli compresses a bundle and returns the compressed file size. */
function brotli(path: string): number {
  const brotli = process.env['BROTLI'] || 'brotli';
  exec(`${brotli} -k -9 -f ${path}`);
  return fs.statSync(`${path}.br`).size;
}

function gen10xAngular(path: string): string {
  const ngPath = metadata.js['angularjs'].bundlePath;
  const ngJS = fs.readFileSync(ngPath, 'utf-8');
  let data = ngJS;
  while (data.length < 10 * 1000 * 1000) {
    data += ngJS;
  }

  const outPath = `out/${path}`;
  fs.writeFileSync(outPath, data);
  return outPath;
}

/**
 * Runs a test suite with a JS bundle substituted in.
 * @return a failure message if failed, undefined on success.
 */
async function runTests(
  test: metadata.Test,
  bundlePath: string
): Promise<string | undefined> {
  const server = new WebServer(test.webroot);
  const port = 9000;
  server.remaps.set('/bundle.js', bundlePath);
  await server.run(port);

  const mocha = new Mocha();
  mocha.addFile(test.test);
  mocha.reporter('progress');
  const failures = await new Promise(resolve => {
    mocha.run(failures => {
      resolve(failures);
    });
  });
  mocha.unloadFiles();
  await server.stop();

  if (failures > 0) {
    console.warn(`run test manually via\n$ ${server.cmdline()}`);
    return 'test failure';
  }
}

async function main() {
  commander
    .option(
      '--tools [regex]',
      'regex to match tools to run',
      arg => new RegExp(arg)
    )
    .option(
      '--inputs [regex]',
      'regex to match inputs to run',
      arg => new RegExp(arg)
    )
    .option('--no-tests', 'skip running tests')
    .parse(process.argv);
  const toolFilter = commander.tools;
  const inputFilter = commander.inputs;

  try {
    fs.mkdirSync('out');
  } catch (e) {
    if (e.code != 'EEXIST') throw e;
  }

  let inputs = Object.keys(metadata.js);
  inputs.sort();

  let results: Result[] = [];
  for (const input of inputs) {
    if (inputFilter && !inputFilter.test(input)) continue;
    const {bundlePath, transform, test, externs} = metadata.js[input];
    let inputPath = bundlePath;
    if (transform) {
      if (transform === 'angularjs 10x') {
        inputPath = gen10xAngular(inputPath);
      } else {
        throw new Error(`unknown transform ${transform}`);
      }
    }
    for (const {id: tool, variants} of metadata.tools) {
      for (const {id: variant, command} of variants) {
        const toolVariant = tool + (variant ? `-${variant}` : '');
        if (toolFilter && !toolFilter.test(toolVariant)) continue;
        console.log(`${input} ${toolVariant}`);
        const out = `out/${input}.${toolVariant}`;
        const cmd = command
          .replace('%%in%%', inputPath)
          .replace('%%out%%', out)
          .replace('%%externs%%', externs || '');

        const result: Result = {
          input,
          tool,
          variant,
          time: 0,
          size: 0,
          gzSize: 0,
          brSize: 0
        };

        const start = Date.now();
        try {
          exec(cmd);
        } catch (e) {
          const end = Date.now();
          result.time = Date.now() - start;
          result.failure = e.toString();
          results.push(result);
          continue;
        }
        result.time = Date.now() - start;

        if (commander.tests && test) {
          const failureMsg = await runTests(test, out);
          if (failureMsg) {
            result.failure = failureMsg;
            results.push(result);
            continue;
          }
        } else {
          result.untested = true;
          console.warn('warning: no test');
        }

        result.size = fs.statSync(out).size;
        result.gzSize = gzip(out);
        result.brSize = brotli(out);

        results.push(result);
      }
    }
  }

  fs.writeFileSync('out/results.json', JSON.stringify(results));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
