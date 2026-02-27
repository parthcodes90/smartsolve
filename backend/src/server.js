import http from 'node:http';

const PORT = Number.parseInt(process.env.PORT ?? '3001', 10);

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    json(res, 400, { error: 'Bad request' });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    json(res, 200, { status: 'ok' });
    return;
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`SmartSolve backend listening on port ${PORT}`);
});
