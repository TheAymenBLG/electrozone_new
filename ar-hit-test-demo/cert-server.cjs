const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const target = req.url === '/ca.crt' ? 'ca.crt' : 'index.html';
  const filePath = path.join(__dirname, target);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const type = req.url === '/ca.crt'
      ? 'application/x-x509-ca-cert'
      : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(8444, '0.0.0.0', () => {
  console.log('Cert server listening on http://0.0.0.0:8444');
});
