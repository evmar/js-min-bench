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
import * as path from 'path';
import {Result} from './json';
import * as metadata from './metadata';

function rollup<T, K extends keyof T>(data: T[], key: K): Map<T[K], T[]> {
  let map = new Map<T[K], T[]>();
  for (let t of data) {
    let row = map.get(t[key]);
    if (!row) {
      row = [];
      map.set(t[key], row);
    }
    row.push(t);
  }
  return map;
}

function min(data: number[]): number {
  let best = data[0];
  for (let d of data) {
    if (d < best) best = d;
  }
  return best;
}

function mult(n: number, base: number): string {
  return (n / base).toFixed(1) + 'x';
}

function sizeCells(size: number, bestSize: number): string {
  const best = size === bestSize ? ' class=best' : '';
  return (
    `<td align=right${best}>${size.toLocaleString()}</td>` +
    `<td align=right${best}>${
      size == bestSize ? '' : mult(size, bestSize)
    }</td>`
  );
}

function resultsTable(allResults: Result[]): string {
  let html = `<table>`;
  html += `<tr><th>input+tool+variant</th><th>size</th><th></th><th>gzip</th><th></th><th>brotli</th><th></th><th>runtime</th></tr>\n`;
  for (const [input, results] of rollup(allResults, 'input').entries()) {
    html += `<tr><td>${input}</td></tr>`;
    const candidates = results.slice(1).filter(r => !r.failure);
    const bestSize = min(
      ([] as number[]).concat(
        ...candidates.map(c => [c.size, c.gzSize, c.brSize])
      )
    );
    const bestTime = min(candidates.map(({time}) => time));
    let lastTool = '';
    for (const result of results) {
      html += `<tr>`;
      if (result.tool != lastTool) {
        html += `<td style='padding-left: 4ex'>${result.tool}</td>`;
        lastTool = result.tool;
      } else {
        html += `<td style='padding-left: 8ex'>+ ${result.variant}</td>`;
      }

      if (!result.failure) {
        html += sizeCells(result.size, bestSize);
        html += sizeCells(result.gzSize, bestSize);
        html += sizeCells(result.brSize, bestSize);
      } else {
        html += `<td colspan=6 align=center title='${
          result.failure
        }'>failed (hover for details)</td>`;
      }

      if (result === results[0]) {
        html += `<td></td>`;
      } else {
        let best = result.time === bestTime ? ' class=best' : '';
        let time = (result.time / 1000).toFixed(1);
        html += `<td align=right${best}>${time}s</td></tr>\n`;
      }
    }
  }
  html += `</table>\n`;
  return html;
}

function inputDetails(): string {
  let html = '<dl>';
  const inputs = Object.keys(metadata.js);
  inputs.sort();
  for (const name of inputs) {
    const meta = metadata.js[name];
    let desc = meta.desc;
    if (meta.path.match(/^third_party/)) {
      const readmePath = path.join(path.dirname(meta.path), 'README.md');
      if (fs.existsSync(readmePath)) {
        desc += `; <a href='${readmePath}'>read more</a>`;
      }
    }
    html += `<dt>${name}</dt>` + `<dd>${desc}</dd>`;
  }
  html += '</dl>\n';
  return html;
}

function toolDetails(): string {
  let html = '<dl>';
  html +=
    `<dt>raw</dt>` + `<dd>raw input file, as baseline for comparison</dd>`;
  for (const tool of metadata.tools.slice(1)) {
    html +=
      `<dt>${tool.id}</dt>` +
      `<dd>${tool.name}<br>` +
      `<tt>$ ${tool.variants[0].command}</tt><br>`;
    if (tool.variants.length > 1) {
      html += `<dl>`;
      for (const variant of tool.variants.slice(1)) {
        html += `<dt>${variant.id}</dt><dd><tt>$ ${
          variant.command
        }</tt></dd>\n`;
      }
      html += `</dl>`;
    }
    html += '</dd>\n';
  }
  html += '</dl>\n';
  return html;
}

function main() {
  const allResults: Result[] = JSON.parse(
    fs.readFileSync('out/results.json', 'utf8')
  );

  const template = fs.readFileSync('src/results.template', 'utf8');
  const templateData: {[k: string]: string} = {
    resultsTable: resultsTable(allResults),
    inputDetails: inputDetails(),
    toolDetails: toolDetails()
  };
  console.log(template.replace(/%%(\w+)%%/g, (_, f) => templateData[f]));
}

main();
