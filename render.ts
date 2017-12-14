import {Result, JSMetadata, ToolsMetadata} from './json';
import * as fs from 'fs';

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
    return (n * 100 / total).toFixed(0) + '%';
}

function main() {
    let allResults: Result[] = JSON.parse(fs.readFileSync('results.json', 'utf8'));
    let jsMetadata = JSON.parse(fs.readFileSync('js/metadata.json', 'utf8'));
    let tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));

    let html = '';
    for (let [input, results] of rollup(allResults, 'input').entries()) {
        html += `<p><tt>${input}</tt>`;
        html += `<table>`;
        html += `<tr><th>tool</th><th>size</th><th></th><th>gzip</th><th></th><th>runtime</th></tr>`;
        let baseline = results[0];
        let bestSize = minRow(results, 'size');
        let bestGz = minRow(results, 'gzSize');
        let bestTime = minRow(results.slice(1), 'time');
        for (let result of results) {
            html += `<tr><td>${result.tool}</td>`;

            let best = result === bestSize ? ' class=best' : '';
            html += `<td align=right${best}>${result.size.toLocaleString()}</td>`
            html += `<td align=right${best}>${percent(result.size, baseline.size)}</td>`;

            best = result === bestGz ? ' class=best' : '';
            html += `<td align=right${best}>${result.gzSize.toLocaleString()}</td>`;
            html += `<td align=right${best}>${percent(result.size, baseline.size)}</td>`;

            if (result === baseline) {
                html += `<td></td>`;
            } else {
                best = result === bestTime ? ' class=best' : '';
                let time = (result.time / 1000).toFixed(1);
                html += `<td align=right${best}>${time}</td></tr>`;
            }
        }
        html += `</table>`;
        html += `</p>`;
    }

    let template = fs.readFileSync('results.template', 'utf8');
    console.log(template.replace(/%%content%%/, html));
}

main();
