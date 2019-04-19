import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';

function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  const reqUrl = url.parse(req.url || '/');
  let reqPath = path.normalize(reqUrl.path || '/');
  if (!reqPath.startsWith('/')) return serveError(400, 'bad path');

  if (reqPath.endsWith('/')) reqPath += 'index.html';
  reqPath = path.join('.', reqPath);

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

const port = 9000;
console.log(`listening on :${port}`);
http.createServer(handler).listen(port);
