const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
// Set the hostname and port if necessary, '0.0.0.0' for external access on cPanel
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// When using a custom server, you need to pass the dev, hostname, and port options to the Next app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`
      // to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Optional: Handle specific custom routes if needed, otherwise use the default handler
      // if (pathname === '/a') {
      //   await app.render(req, res, '/a', query);
      // } else if (pathname === '/b') {
      //   await app.render(req, res, '/b', query);
      // } else {
      await handle(req, res, parsedUrl);
      // }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});