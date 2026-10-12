import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import https from 'node:https';
import http from 'node:http';

function videoProxyPlugin(): Plugin {
  const handleProxy = (req: any, res: any) => {
    try {
      const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
      const fileId = parsedUrl.searchParams.get('id');
      const directUrl = parsedUrl.searchParams.get('url');

      let targetUrl = '';
      if (fileId) {
        targetUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
      } else if (directUrl) {
        if (directUrl.includes('drive.google.com') || directUrl.includes('drive.usercontent.google.com')) {
          const match = directUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || directUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            targetUrl = `https://drive.usercontent.google.com/download?id=${match[1]}&export=download`;
          } else {
            targetUrl = directUrl;
          }
        } else {
          targetUrl = directUrl;
        }
      }

      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing id or url parameter');
        return;
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      if (req.headers.range) {
        headers['range'] = req.headers.range;
      }

      const client = targetUrl.startsWith('https') ? https : http;
      client.get(targetUrl, { headers }, (proxyRes) => {
        // Handle redirect (e.g., 301, 302, 303, 307)
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          const redirectLocation = proxyRes.headers.location;
          https.get(redirectLocation, { headers }, (redirectRes) => {
            res.writeHead(redirectRes.statusCode || 200, {
              'Content-Type': redirectRes.headers['content-type'] || 'video/mp4',
              'Content-Length': redirectRes.headers['content-length'] || '',
              'Content-Range': redirectRes.headers['content-range'] || '',
              'Accept-Ranges': 'bytes',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400',
            });
            redirectRes.pipe(res);
          }).on('error', () => {
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('Failed to fetch redirected video');
            }
          });
          return;
        }

        res.writeHead(proxyRes.statusCode || 200, {
          'Content-Type': proxyRes.headers['content-type'] || 'video/mp4',
          'Content-Length': proxyRes.headers['content-length'] || '',
          'Content-Range': proxyRes.headers['content-range'] || '',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        });
        proxyRes.pipe(res);
      }).on('error', () => {
        if (!res.headersSent) {
          res.statusCode = 502;
          res.end('Failed to proxy video');
        }
      });
    } catch {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal proxy error');
      }
    }
  };

  return {
    name: 'video-proxy',
    configureServer(server) {
      server.middlewares.use('/api/video-proxy', handleProxy);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/video-proxy', handleProxy);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    videoProxyPlugin(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
