const nodemailer = require('nodemailer');

const EMAIL_TIMEOUT_MS = 12000;

function normalizeEmailSender(value) {
  const raw = String(value || '').trim().replace(/^["']|["']$/g, '').trim();
  const match = raw.match(/^(?:(.*?)\\s*)?<([^<>]+)>$/);
  const address = (match ? match[2] : raw).trim();
  const displayName = match?.[1]?.trim();
  const validAddress = /^[^\\s<>@]+@[^\\s<>@]+\\.[^\\s<>@]+$/.test(address);

  if (!validAddress) {
    const error = new Error('Email sender must be a valid address or a display name followed by an address, for example Ahadu Tech Academy <support@example.com>.');
    error.code = 'EMAIL_INVALID_CONFIG';
    error.configField = 'RESEND_FROM / SMTP_FROM / EMAIL_FROM';
    throw error;
  }

  return displayName ? displayName + ' <' + address + '>' : address;
}

function getEmailSender() {
  const configuredFrom = process.env.RESEND_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim();
  if (!configuredFrom) {
    const error = new Error('Email service is not configured. Set RESEND_FROM, SMTP_FROM, or EMAIL_FROM.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }
  return normalizeEmailSender(configuredFrom);
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = getEmailSender();
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass) {
    const missing = [!host && 'SMTP_HOST', !user && 'SMTP_USER', !pass && 'SMTP_PASS'].filter(Boolean);
    const error = new Error('Email service is not configured. Missing: ' + missing.join(', '));
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error('SMTP_PORT must be a valid TCP port.');
    error.code = 'EMAIL_INVALID_CONFIG';
    throw error;
  }
  return { host, user, pass, from, port };
}

async function sendWithResend(to, subject, { html, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');
  const from = getEmailSender();

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
      signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
    });
  } catch (cause) {
    const error = new Error('Resend email API request failed or timed out.');
    error.code = cause?.name === 'TimeoutError' || cause?.name === 'AbortError'
      ? 'EMAIL_PROVIDER_TIMEOUT'
      : 'EMAIL_PROVIDER_NETWORK_ERROR';
    error.provider = 'resend';
    error.causeCode = cause?.code;
    error.causeName = cause?.name;
    error.causeMessage = cause?.message;
    error.cause = cause;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    const providerMessage = typeof data.message === 'string'
      ? data.message
      : typeof data.error === 'string'
        ? data.error
        : 'Resend did not accept the email.';
    const error = new Error(providerMessage);
    error.provider = 'resend';
    error.providerStatus = response.status;
    error.providerCode = typeof data.name === 'string' ? data.name : undefined;
    error.providerRequestId = response.headers.get('x-request-id') || response.headers.get('request-id') || undefined;
    error.code = response.status === 401 || response.status === 403
      ? 'EMAIL_INVALID_CONFIG'
      : response.status >= 500 || response.status === 429
        ? 'EMAIL_PROVIDER_TEMPORARILY_UNAVAILABLE'
        : 'EMAIL_PROVIDER_REJECTED';
    throw error;
  }

  console.info('[email] Password reset message accepted by Resend:', {
    messageId: data.id,
    recipientCount: 1,
  });
  return { sent: true, messageId: data.id, provider: 'resend' };
}

async function sendWithSmtp(to, subject, { html, text }) {
  const config = getSmtpConfig();
  const secure = process.env.SMTP_SECURE === undefined
    ? config.port === 465
    : String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });

  try {
    await transporter.verify();
    const info = await transporter.sendMail({ from: config.from, to, subject, html, text });
    if (!info.accepted?.length || info.rejected?.length) {
      const error = new Error('SMTP provider did not accept the reset email recipient.');
      error.code = 'EMAIL_RECIPIENT_NOT_ACCEPTED';
      throw error;
    }
    console.info('[email] Password reset message accepted by SMTP provider:', {
      messageId: info.messageId,
      recipientCount: info.accepted.length,
    });
    return { sent: true, messageId: info.messageId, provider: 'smtp' };
  } finally {
    transporter.close();
  }
}

async function verifyEmailService() {
  if (process.env.RESEND_API_KEY?.trim()) {
    getEmailSender();
    return true;
  }
  const config = getSmtpConfig();
  const secure = process.env.SMTP_SECURE === undefined
    ? config.port === 465
    : String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  try {
    await transporter.verify();
    return true;
  } finally {
    transporter.close();
  }
}

async function sendPasswordResetEmail(to, subject, content) {
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendWithResend(to, subject, content);
  }
  return sendWithSmtp(to, subject, content);
}

module.exports = { sendPasswordResetEmail, verifyEmailService };
