const nodemailer = require('nodemailer');

async function sendPasswordResetEmail(to, subject, html) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    FRONTEND_URL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER) {
    console.warn('[email] SMTP not configured. Set SMTP_HOST/SMTP_USER in .env to send emails.');
    return { sent: false, dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
    text: html.replace(/<[^>]*>/g, ' '),
  });

  void FRONTEND_URL;
  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
