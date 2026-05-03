const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

dotenv.config();

const { assertRequiredEnv } = require('./config/env');
const { connectMongoose } = require('./db/connectMongoose');

assertRequiredEnv();

/**
 * Visible crash logging — avoids silent exits on Render.
 */
function crashLog(kind, payload) {
  const ts = new Date().toISOString();
  const line = '═'.repeat(60);
  console.error(`\n${line}\n[FATAL ${kind}] ${ts}\n${line}`);
  if (payload instanceof Error) {
    console.error(payload.stack || `${payload.name}: ${payload.message}`);
  } else {
    console.error(payload);
  }
  console.error(`${line}\n`);
}

process.on('uncaughtException', (err) => {
  crashLog('uncaughtException', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  crashLog('unhandledRejection', err);
  process.exit(1);
});

/**
 * Listen port: Render (and similar platforms) set process.env.PORT dynamically.
 * Only use the fallback when PORT is absent (local `node server.js` without env).
 */
function resolveListenPort() {
  const raw = process.env.PORT;
  if (raw === undefined || String(raw).trim() === '') {
    console.log('[Server] process.env.PORT unset — local fallback 5002 (set PORT on Render automatically).');
    return 5002;
  }
  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 65535) {
    console.warn('[Server] Invalid process.env.PORT, using 5002:', raw);
    return 5002;
  }
  return parsed;
}

const PORT = resolveListenPort();
const HOST = process.env.HOST || '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

const profilesDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const contentRoutes = require('./routes/content');
const courseContentRoutes = require('./routes/courseContent');
const departmentRoutes = require('./routes/departments');
const universityYearRoutes = require('./routes/universityYears');
const universityRoutes = require('./routes/universities');
const universityCourseRoutes = require('./routes/universityCourses');
const universityContentRoutes = require('./routes/universityContent');

const app = express();
app.disable('x-powered-by');

function healthJson() {
  const dbReady = mongoose.connection.readyState === 1;
  return {
    ok: true,
    status: 'healthy',
    service: 'Ahadu Tech Academy API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbReady ? 'connected' : 'disconnected',
    mongoReadyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  };
}

if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', 1);
}

const corsOrigins = process.env.CLIENT_ORIGINS;
app.use(
  cors(
    corsOrigins
      ? {
          origin: corsOrigins.split(',').map((o) => o.trim()).filter(Boolean),
          credentials: true,
        }
      : {
          origin: true,
          credentials: true,
        }
  )
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/** Render / load-balancer probes often hit `/`. */
app.get('/', (req, res) => {
  res.status(200).json(healthJson());
});

/** Same payload for tooling that expects `/api/health`. */
app.get('/api/health', (req, res) => {
  res.status(200).json(healthJson());
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', universityCourseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content', courseContentRoutes);
app.use('/api/content', universityContentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/university-years', universityYearRoutes);
app.use('/api/universities', universityRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found', path: req.originalUrl });
});

app.use((err, req, res, _next) => {
  console.error('[Express]', err.stack || err.message || err);
  const status = err.status && Number(err.status) ? err.status : 500;
  res.status(status).json({
    ok: false,
    error: 'Internal server error',
    ...(isProd ? {} : { message: err.message, stack: err.stack }),
  });
});

async function gracefulShutdown(signal) {
  console.log(`[Server] ${signal} received — closing HTTP and Mongo connections…`);

  await new Promise((resolve) => {
    if (!serverRef) return resolve();
    serverRef.close((closeErr) => {
      if (closeErr) console.error('[Server] HTTP close error:', closeErr.message);
      else console.log('[Server] HTTP listener closed.');
      resolve();
    });
  });

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Server] Mongoose disconnected.');
    }
  } catch (e) {
    console.error('[Server] Mongoose disconnect error:', e.message);
  }

  process.exit(0);
}

let serverRef;

serverRef = app.listen(PORT, HOST, () => {
  console.log(`[Server] Listening on http://${HOST}:${PORT} (PORT from env: ${process.env.PORT ?? '(unset, fallback)'})`);
  console.log(`[Server] NODE_ENV=${process.env.NODE_ENV || '(unset)'}`);
  void connectMongoose();
});

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
