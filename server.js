// iGuss Server - ONCE-compatible (with backup API)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 80;
const STORAGE_DIR = '/storage';
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups');

// Ensure storage directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Generate safe filename from backupId
function getBackupPath(backupId) {
  // Sanitize: only allow alphanumeric, underscore, hyphen
  const safeId = backupId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(BACKUP_DIR, `${safeId}.json`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Healthcheck endpoint
  if (pathname === '/up') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // API: Save backup
  if (pathname === '/api/backup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { backupId, plants } = data;
        
        if (!backupId || !Array.isArray(plants)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid data' }));
          return;
        }

        const backupData = {
          backupId,
          plants,
          savedAt: new Date().toISOString(),
          version: 1
        };

        const backupPath = getBackupPath(backupId);
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, savedAt: backupData.savedAt }));
      } catch (err) {
        console.error('Backup error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
      }
    });
    return;
  }

  // API: Get backup
  if (pathname.startsWith('/api/backup/') && req.method === 'GET') {
    const backupId = pathname.split('/')[3];
    if (!backupId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing backupId' }));
      return;
    }

    try {
      const backupPath = getBackupPath(backupId);
      if (!fs.existsSync(backupPath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Backup not found' }));
        return;
      }

      const data = fs.readFileSync(backupPath, 'utf8');
      const backup = JSON.parse(data);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        backupId: backup.backupId,
        plants: backup.plants,
        savedAt: backup.savedAt
      }));
    } catch (err) {
      console.error('Restore error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
    return;
  }

  // Static file serving
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`iGuss server running on port ${PORT}`);
});
