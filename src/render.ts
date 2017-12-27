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

function minRow<T, K extends keyof T>(data: T[], key: K): T {
    let best = data[0];
    for (let t of data) {
        let val = t[key];
        if (val < best[key]) best = t;
    }
    return best;
}

function percent(n: number, total: number): string {
    const p = n * 100 / total;
    return p.toFixed(p < 10 ? 1 : 0) + '%';
}

function main() {
    let allResults: Result[] = JSON.parse(fs.readFileSync('out/results.json', 'utf8'));

    let html = '';
    for (let [input, results] of rollup(allResults, 'input').entries()) {
        html += `<p><tt>${input}</tt>`;
        html += `<table>`;
        html += `<tr><th>tool</th><th>size</th><th></th><th>gzip</th><th></th><th>brotli</th><th></th><th>runtime</th></tr>\n`;
        let baseline = results[0].size;
        let candidates = results.slice(1).filter(r => !r.failed);
        let bestSize = minRow(candidates, 'size');
        let bestGz = minRow(candidates, 'gzSize');
        let bestBr = minRow(candidates, 'brSize');
        let bestTime = minRow(candidates, 'time');
        for (let result of results) {
            html += `<tr><td>${result.tool}</td>`;

            if (!result.failed) {
                let best = result === bestSize ? ' class=best' : '';
                html += `<td align=right${best}>${result.size.toLocaleString()}</td>`
                html += `<td align=right${best}>${percent(result.size, baseline)}</td>`;

                best = result === bestGz ? ' class=best' : '';
                html += `<td align=right${best}>${result.gzSize.toLocaleString()}</td>`;
                html += `<td align=right${best}>${percent(result.gzSize, baseline)}</td>`;

                best = result === bestBr ? ' class=best' : '';
                html += `<td align=right${best}>${result.brSize.toLocaleString()}</td>`;
                html += `<td align=right${best}>${percent(result.brSize, baseline)}</td>`;
            } else {
                html += `<td colspan=6>failed</td>`;
            }

            if (result === results[0]) {
                html += `<td></td>`;
            } else {
                let best = result === bestTime ? ' class=best' : '';
                let time = (result.time / 1000).toFixed(1);
                html += `<td align=right${best}>${time}</td></tr>\n`;
            }
        }
        html += `</table>`;
        html += `</p>\n`;
    }

    html += '<h2>input details</h2>';
    html += '<dl>';
    const inputs = Object.keys(metadata.js);
    inputs.sort();
    for (const name of inputs) {
        html += `<dt>${name}</dt>` +
            `<dd>${metadata.js[name].desc}</dd>`;
    }
    html += '</dl>\n';

    html += '<h2>tool details</h2>';
    html += '<dl>';
    for (const tool of metadata.tools.slice(1)) {
        html += `<dt>${tool.name}</dt>` +
            `<dd>${tool.desc}<br>` +
            `<tt>$ ${tool.command}</tt></dd>`;
    }
    html += '</dl>\n';

    let template = fs.readFileSync('src/results.template', 'utf8');
    console.log(template.replace(/%%content%%/, html));
}

main();
