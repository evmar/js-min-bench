import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as commander from 'commander';

export class WebServer {
  server = http.createServer(this.handler.bind(this));
  listening: Promise<void> = new Promise(resolve => {
    this.server.on('listening', () => {
      resolve();
    });
  });
  remaps = new Map<string, string>();

  constructor(private root: string) {}

  private handler(req: http.IncomingMessage, res: http.ServerResponse) {
    const reqUrl = url.parse(req.url || '/');
    let reqPath = path.normalize(reqUrl.path || '/');
    if (!reqPath.startsWith('/')) return serveError(400, 'bad path');

    if (reqPath.endsWith('/')) reqPath += 'index.html';

    const remap = this.remaps.get(reqPath);
    if (remap) {
      reqPath = path.normalize(remap);
    } else {
      reqPath = path.join(this.root, reqPath);
    }

    const file = fs.createReadStream(reqPath);
    file.on('error', err => {
      serveError(500, err.toString());
    });
    file.pipe(res);

    function serveError(status: number, msg: string) {
      res.statusCode = status;
      res.end(msg);
    }
  }

  run(port: number) {
    this.server.listen(port);
    return this.listening;
  }

  stop(): Promise<void> {
    return new Promise(resolve => {
      this.server.close(() => {
        resolve();
      });
    });
  }
}

if (require.main === module) {
  commander
    .option('--remap <urlpath=filepath>', 'remap request path')
    .parse(process.argv);

  const server = new WebServer('.');
  if (commander.remap) {
    const [src, dst] = commander.remap.split('=');
    server.remaps.set(src, dst);
  }
  server.run(9000);
  console.log('listening on :9000');
}
