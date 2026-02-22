require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT || 8080);
const root = __dirname;
const dbPath = path.join(root, 'data', 'collectes.json');

function ensureDb() {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '[]');
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function postWebhook(url, payload) {
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
  }
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'text/plain; charset=utf-8';
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = requestUrl;

  if (req.method === 'GET' && pathname === '/api/collectes') {
    sendJson(res, 200, readDb());
    return;
  }

  if (req.method === 'POST' && pathname === '/api/collectes') {
    try {
      const body = await parseBody(req);
      const db = readDb();
      const record = {
        id: db.length + 1,
        nom: body.nom,
        telephone: body.telephone,
        ville: body.ville,
        typeClient: body.typeClient,
        creneau: body.creneau,
        canettes: Number(body.canettes),
        statut: 'nouvelle',
        createdAt: new Date().toISOString(),
      };
      db.unshift(record);
      writeDb(db);

      await Promise.all([
        postWebhook(process.env.EMAIL_WEBHOOK_URL=https://hook.eu1.make.com/rh2ci7higigc4ocqk8f3vm1weeh7tnhu, { channel: 'email', record }),
        postWebhook(process.env.WHATSAPP_WEBHOOK_URL, { channel: 'whatsapp', record }),
      ]);

      sendJson(res, 201, record);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/collectes/')) {
    const match = pathname.match(/^\/api\/collectes\/(\d+)\/status$/);
    if (!match) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    try {
      const id = Number(match[1]);
      const body = await parseBody(req);
      const db = readDb();
      const target = db.find((item) => item.id === id);

      if (!target) {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }

      target.statut = body.statut;
      writeDb(db);
      sendJson(res, 200, target);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
