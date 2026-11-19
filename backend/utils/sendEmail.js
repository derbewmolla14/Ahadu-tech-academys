const nodemailer = require('nodemailer');

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim() || process.env.EMAIL_FROM?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !from) {
    const missing = [!host && 'SMTP_HOST', !user && 'SMTP_USER', !pass && 'SMTP_PASS', !from && 'SMTP_FROM (or EMAIL_FROM)'].filter(Boolean);
    const error = new Error('Email service is not configured. Missing: ' + missing.join(', '));
    error.code = 'EMAIL_NOT_CONFIGURED'; throw error;
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) { const error = new Error('SMTP_PORT must be a valid TCP port.'); error.code = 'EMAIL_INVALID_CONFIG'; throw error; }
  return { host, user, pass, from, port };
}

async function verifyEmailService() {
  const config = getSmtpConfig();
  const secure = process.env.SMTP_SECURE === undefined ? config.port === 465 : String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure, auth: { user: config.user, pass: config.pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
  try { await transporter.verify(); } finally { transporter.close(); }
}

async function sendPasswordResetEmail(to, subject, { html, text }) {
  const config = getSmtpConfig();
  const secure = process.env.SMTP_SECURE === undefined ? config.port === 465 : String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({ host: config.host, port: config.port, secure, auth: { user: config.user, pass: config.pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
  try {
    await transporter.verify();
    const info = await transporter.sendMail({ from: config.from, to, subject, html, text });
    if (!info.accepted?.length || info.rejected?.length) { const error = new Error('SMTP provider did not accept the reset email recipient.'); error.code = 'EMAIL_RECIPIENT_NOT_ACCEPTED'; throw error; }
    console.info('[email] Password reset message accepted by SMTP provider:', { messageId: info.messageId, recipientCount: info.accepted.length });
    return { sent: true, messageId: info.messageId };
  } finally { transporter.close(); }
}

module.exports = { sendPasswordResetEmail, verifyEmailService };