/**
 * Environment-derived secrets (process.env only — no hardcoded DB URLs or JWT keys).
 */

function assertRequiredEnv() {
  if (!process.env.JWT_SECRET?.trim()) {
    console.error('[Config] Missing JWT_SECRET in process.env.');
    console.error('[Config] Add JWT_SECRET on Render (Environment) or in backend/.env for local dev.');
    console.error('[Config] See backend/.env.example');
    process.exit(1);
  }
  console.log('[Config] JWT_SECRET present.');
}

/** Call after assertRequiredEnv() at process startup */
function getJwtSecret() {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) {
    throw new Error('JWT_SECRET is not set (should have failed at startup).');
  }
  return s;
}

module.exports = {
  assertRequiredEnv,
  getJwtSecret,
};
