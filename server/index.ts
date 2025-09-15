import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

// CORS için gerekli middleware
const cors = (req: Request, res: Response, next: NextFunction) => {
  // Vercel'deki frontend URL'i
  const allowedOrigins = ['https://clktechtr-client.vercel.app', 'https://clktechtr.vercel.app', 'https://clktech.vercel.app', 'http://localhost:5000', 'http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Tüm originlere izin ver (geliştirme için, production'da daha kısıtlayıcı olabilir)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware'ini uygula
app.use(cors);

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (body: any) {
    capturedJsonResponse = body;
    return originalResJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // PUBLIC KLASÖRÜNÜ DEVELOPMENT MODUNDA DA SUN
  app.use(express.static('public'));

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }
  // In production, don't serve static files on Render - that's handled by Vercel
  // Only serve static files if we detect we're not on Render (e.g., local production testing)

  // Serve the app on specified port or default to 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  server.listen({
    port,
    host
  }, () => {
    log(`serving on port ${port} with host ${host}`);
  });
})();
