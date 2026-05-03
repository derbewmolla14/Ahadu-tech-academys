const mongoose = require('mongoose');

function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '(unset)';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/gi, '$1****$2');
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parsePositiveInt(raw, fallback) {
  const n = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function migrateLegacyRoles() {
  try {
    const r = await mongoose.connection.collection('users').updateMany(
      { role: 'student' },
      { $set: { role: 'user' } }
    );
    if (r.modifiedCount > 0) {
      console.log(`[MongoDB] Migrated legacy user roles: ${r.modifiedCount}`);
    }
  } catch (migrateErr) {
    console.warn('[MongoDB] Role migration skipped:', migrateErr.message);
  }
}

/** Register Mongoose lifecycle logs once — safe across retries */
function wireConnectionEvents() {
  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Runtime connection error:', err.message);
    });
  }
  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Mongoose disconnected from cluster.');
    });
  }
}

/**
 * Connect to MongoDB Atlas using MONGO_URI only (no localhost Mongo fallback).
 * Retries transient failures suitable for Render cold starts / Atlas warmup.
 *
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
async function connectMongoose() {
  mongoose.set('strictQuery', true);

  const mongoUriRaw = process.env.MONGO_URI;
  if (!mongoUriRaw || !String(mongoUriRaw).trim()) {
    console.error(
      '[MongoDB] FAILURE: MONGO_URI is not set or empty. Set it in `.env` (local) or Render Environment.'
    );
    return false;
  }

  wireConnectionEvents();

  const maxAttempts = parsePositiveInt(process.env.MONGO_CONNECT_RETRIES, 5);
  const baseDelayMs = parsePositiveInt(process.env.MONGO_CONNECT_RETRY_DELAY_MS, 2500);

  console.log('[MongoDB] Using mongoose.connect(process.env.MONGO_URI.trim())');

  const options = {
    serverSelectionTimeoutMS: parsePositiveInt(process.env.MONGO_SERVER_SELECTION_MS, 15000),
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`[MongoDB] Attempt ${attempt}/${maxAttempts}…`);
      await mongoose.connect(process.env.MONGO_URI.trim(), options);

      console.log('[MongoDB] SUCCESS: Connected to MongoDB.');
      console.log('[MongoDB] URI (masked):', maskMongoUri(process.env.MONGO_URI.trim()));
      console.log('[MongoDB] Ready state:', mongoose.connection.readyState, '(1=connected)');

      await migrateLegacyRoles();

      return true;
    } catch (err) {
      console.error(`[MongoDB] FAILURE on attempt ${attempt}/${maxAttempts}:`, err.message);
      if (err.code) console.error('[MongoDB] Error code:', err.code);
      if (err.reason) console.error('[MongoDB] Detail:', String(err.reason));

      if (attempt === maxAttempts) {
        console.error(
          `[MongoDB] Exhausted ${maxAttempts} attempts. Continuing without DB (Atlas IP allowlist / credentials check).`
        );
        console.error('[MongoDB] Failed URI (masked):', maskMongoUri(process.env.MONGO_URI.trim()));
        return false;
      }

      const backoffMs = Math.min(baseDelayMs * 2 ** (attempt - 1), 60_000);
      console.warn(`[MongoDB] Retrying after ${backoffMs}ms…`);
      await delay(backoffMs);
    }
  }

  return false;
}

module.exports = { connectMongoose };
