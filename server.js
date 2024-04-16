/* eslint-disable no-console */

// Import required modules
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const { join } = require("path");
require("dotenv").config();

// Create a Next.js app instance
const app = next({ dev: process.env.NEXT_PUBLIC_DEV === "true" });

// Define a request handler for the app
const handle = app.getRequestHandler();

// Determine which SSL certificate to use based on the environment
const filePath = process.env.NEXT_PUBLIC_DEV === "true" ? "dev-opengeo" : "prod-opengeo";

// Load the SSL certificate and key
const httpsOptions = {
  key: fs.readFileSync(`./ssl/${filePath}-key.pem`),
  cert: fs.readFileSync(`./ssl/${filePath}-cert.pem`),
  passphrase: process.env.PASSPHRASE_CERT,
};

// Prepare the Next.js app and start the HTTPS server
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    if (pathname === "/sw.js" || /^\/(workbox|worker|fallback)-\w+\.js$/.test(pathname)) {
      const filePath = join(__dirname, ".next", pathname);
      app.serveStatic(req, res, filePath);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(443, "0.0.0.0", (err) => {
    if (err) throw err;
    /* eslint-disable no-console */
    console.error(err);
  });
});
