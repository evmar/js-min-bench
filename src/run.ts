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

import { promisify } from "util";
import * as fs from "fs";
import * as childProcess from "child_process";
import { Result } from "./json";
import * as metadata from "./metadata";
import * as commander from "commander";

const exec = promisify(childProcess.exec);

async function gzip(path: string) {
  await exec(`gzip -k -9 -f ${path}`);
}

async function brotli(path: string) {
  const brotli = process.env["BROTLI"] || "brotli";
  await exec(`${brotli} -k -9 -f ${path}`);
}

async function summarize(results: Result[]) {
  await promisify(fs.writeFile)("out/results.json", JSON.stringify(results));
}

async function gen10xAngular(path: string): Promise<string> {
  const ngPath = metadata.js["angularjs"].path;
  const ngJS = await promisify(fs.readFile)(ngPath, "utf-8");
  let data = ngJS;
  while (data.length < 10 * 1000 * 1000) {
    data += ngJS;
  }

  const outPath = `out/${path}`;
  await promisify(fs.writeFile)(outPath, data);
  return outPath;
}

async function main() {
  commander
    .option("--tools [list]", "tools to run [default=all]", arg =>
      arg.split(/,/)
    )
    .parse(process.argv);
  const tools: string[] | undefined = commander.tools;

  try {
    fs.mkdirSync("out");
  } catch (e) {
    if (e.code != "EEXIST") throw e;
  }

  let inputs = Object.keys(metadata.js);
  inputs.sort();

  let results: Result[] = [];
  for (const input of inputs) {
    const { path, transform } = metadata.js[input];
    let inputPath = path;
    if (transform) {
      if (transform === "angularjs 10x") {
        inputPath = await gen10xAngular(inputPath);
      } else {
        throw new Error(`unknown transform ${transform}`);
      }
    }
    for (const { id: tool, variants } of metadata.tools) {
      for (const { id: variant, command } of variants) {
        const toolVariant = tool + (variant ? `-${variant}` : "");
        if (tools && tools.indexOf(toolVariant) < 0) continue;
        console.log(`${input} ${toolVariant}`);
        let out = `out/${input}.${toolVariant}`;
        let cmd = command.replace("%%in%%", inputPath).replace("%%out%%", out);
        let start = Date.now();
        try {
          await exec(cmd);
        } catch (e) {
          let end = Date.now();
          results.push({
            input,
            tool,
            variant,
            time: end - start,
            size: 0,
            gzSize: 0,
            brSize: 0,
            failed: true
          });
          continue;
        }
        let end = Date.now();
        let size = fs.statSync(out).size;
        await gzip(out);
        let gzSize = fs.statSync(`${out}.gz`).size;
        await brotli(out);
        let brSize = fs.statSync(`${out}.br`).size;

        results.push({
          input,
          tool,
          variant,
          time: end - start,
          size,
          gzSize,
          brSize
        });
      }
    }
  }

  await summarize(results);
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
