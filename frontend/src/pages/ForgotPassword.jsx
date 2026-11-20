import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const inputClass = 'mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-sky-500 disabled:opacity-60';
const buttonClass = 'w-full rounded-2xl bg-sky-500 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60';
function isTransientRequestFailure(error) {
  const status = error?.response?.status;
  const responseCode = String(error?.response?.data?.code || '');
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  if (['EMAIL_NOT_CONFIGURED', 'EMAIL_INVALID_CONFIG'].includes(responseCode)) return false;
  if (status === 503 && responseCode) {
    return ['AUTH_DATABASE_UNAVAILABLE', 'EMAIL_TEMPORARILY_UNAVAILABLE'].includes(responseCode);
  }
  return [502, 503, 504].includes(status) ||
    ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ERR_HTTP2_PROTOCOL_ERROR'].includes(code) ||
    /network error|failed to fetch|http2|connection (?:reset|closed)|temporarily unavailable/i.test(message);
}

function getRequestFailureMessage(error, action) {
  const responseCode = String(error?.response?.data?.code || '');
  if (['EMAIL_NOT_CONFIGURED', 'EMAIL_INVALID_CONFIG'].includes(responseCode)) {
    return 'Password reset email is not configured on the server. Please contact support; retrying will not fix this configuration issue.';
  }
  if (isTransientRequestFailure(error)) {
    return `The service is temporarily unavailable. Your request was not confirmed. Please wait a moment and try ${action} again.`;
  }
  return error?.response?.data?.message || `Could not ${action}. Please try again.`;
}

const RETRY_DELAYS_MS = [1500, 2500];

function languageModeFor(user) {
  const value = String(user?.preferences?.language || localStorage.getItem('language') || 'en').toLowerCase();
  return ['am', 'amharic', 'አማርኛ'].includes(value) ? 'am' : value === 'both' ? 'both' : 'en';
}

function tr(mode, en, am) {
  return mode === 'am' ? am : mode === 'both' ? en + ' / ' + am : en;
}

async function postWithShortRetry(path, payload, onRetry) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await api.post(path, payload, { timeout: 40000 });
    } catch (error) {
      lastError = error;
      if (!isTransientRequestFailure(error) || attempt >= RETRY_DELAYS_MS.length) throw error;
      onRetry(attempt + 1, RETRY_DELAYS_MS[attempt]);
      await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
  throw lastError;
}


export default function ForgotPassword() {
  const { user } = useContext(AuthContext);
  const languageMode = languageModeFor(user);
  const [telegramBotLink, setTelegramBotLink] = useState('');
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryStatus, setRetryStatus] = useState('');

  useEffect(() => {
    if (!otpExpiry) {
      setRemaining(0);
      return undefined;
    }
    const update = () => setRemaining(Math.max(0, Math.ceil((otpExpiry - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [otpExpiry]);

  const countdown = String(Math.floor(remaining / 60)).padStart(2, '0') + ':' + String(remaining % 60).padStart(2, '0');

  useEffect(() => {
    if (!otpSent || method !== 'telegram' || !otpExpiry) return undefined;
    const delay = Math.max(0, otpExpiry - Date.now());
    const timer = window.setTimeout(() => {
      if (method === 'telegram') sendTelegramOtp();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [otpSent, method, otpExpiry]);

  async function sendEmailLink(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setRetryStatus('');
    setLoading(true);
    try {
      await postWithShortRetry('/auth/forgot-password', { email: email.trim().toLowerCase() }, (retry) => setRetryStatus(`Server is waking up, retrying… (${retry}/2)`));
      setEmailSent(true);
      setMessage('If an account matches this email, password reset instructions have been sent. Check your inbox and spam folder. The link expires in one hour.');
    } catch (err) {
      setError(getRequestFailureMessage(err, 'send the password reset link'));
    } finally {
      setLoading(false);
      setRetryStatus('');
    }
  }

  async function sendTelegramOtp() {
    setError('');
    setMessage('');
    setRetryStatus('');
    setLoading(true);
    try {
      const response = await postWithShortRetry('/auth/telegram/otp/request', { email: email.trim().toLowerCase() }, (retry) => setRetryStatus(`Server is waking up, retrying… (${retry}/2)`));
      const seconds = Number(response.data?.expiresInSeconds || 120);
      const expiresAt = response.data?.expiresAt ? new Date(response.data.expiresAt).getTime() : Date.now() + seconds * 1000;
      setOtpExpiry(expiresAt);
      setTelegramBotLink(response.data?.telegramDeepLink || response.data?.telegramBotLink || '');
      setOtpSent(true);
      setOtp('');
      setMessage(tr(languageMode, 'A 6-digit code was sent to your linked Telegram account. It is valid until the 2-minute window ends.', '6 አሃዝ ያለው ኮድ ወደ ተገናኘው ቴሌግራም ተልኳል። የ2 ደቂቃ ጊዜው እስኪያበቃ ድረስ ይሰራል።'));
    } catch (err) {
      const data = err.response?.data;
      if (data?.expiresInSeconds) {
        setOtpExpiry(Date.now() + Number(data.expiresInSeconds) * 1000);
        setOtpSent(true);
      }
      if (data?.code === 'TELEGRAM_NOT_LINKED') {
        setTelegramBotLink(data.telegramBotLink || '');
        setError(tr(languageMode, 'Your account is not linked to Telegram. Sign in, open Settings → Account & Profile → Link Telegram, open the secure link and press Start in the bot. Then return here and request a code. You can also reset by email.', 'መለያዎ ከቴሌግራም ጋር አልተገናኘም። ይግቡ፣ Settings → Account & Profile → Link Telegram ይክፈቱ፣ የደህንነት ሊንኩን በቴሌግራም ከፍተው Start ይጫኑ። ከዚያ ወደዚህ ተመልሰው ኮድ ይጠይቁ። በኢሜይልም መቀየር ይችላሉ።'));
      } else if (data?.code === 'INVALID_EMAIL') {
        setError(tr(languageMode, data.message || 'Enter a valid registered email address.', 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።'));
      } else if (data?.code === 'OTP_ACTIVE') {
        setError(tr(languageMode, data.message || 'A code is already active. Enter it or wait for the countdown before requesting another.', 'ኮድ አስቀድሞ ንቁ ነው። የተላከውን ኮድ ያስገቡ ወይም ቆጣሪው እስኪያበቃ ይጠብቁ።'));
      } else if (data?.code === 'TELEGRAM_DELIVERY_FAILED') {
        setError(tr(languageMode, data.message || 'Telegram could not deliver the code. Check the bot and try again.', 'ቴሌግራም ኮዱን መላክ አልቻለም። ቦቱን ያረጋግጡና እንደገና ይሞክሩ።'));
      } else {
        setError(tr(languageMode, getRequestFailureMessage(err, 'request a Telegram code'), 'የቴሌግራም ኮድ መጠየቅ አልተቻለም። እባክዎ እንደገና ይሞክሩ።'));
      }
    } finally {
      setLoading(false);
      setRetryStatus('');
    }
  }

  async function resetWithOtp(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError(tr(languageMode, 'The new password and confirmation do not match.', 'አዲሱ የይለፍ ቃል እና ማረጋገጫው አይዛመዱም።'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/telegram/otp/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      await api.post('/auth/telegram/otp/reset', {
        email: email.trim().toLowerCase(),
        password,
      });
      setMessage(tr(languageMode, 'Password reset successfully. You can now sign in.', 'የይለፍ ቃሉ በተሳካ ሁኔታ ተቀይሯል። አሁን መግባት ይችላሉ።'));
      setOtpSent(false);
      setOtpExpiry(0);
      setOtpVerified(false);
      setOtp('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const data = err.response?.data || {};
      const en = data.code === 'OTP_EXPIRED_OR_INVALID' || data.code === 'OTP_EXPIRED_OR_USED' || data.code === 'OTP_VERIFICATION_REQUIRED'
        ? 'This code has expired or was already used. Request a new code.'
        : data.code === 'OTP_INCORRECT' || data.code === 'OTP_ATTEMPTS_EXCEEDED'
          ? data.message || 'The code is incorrect or too many attempts were made. Request a new code.'
          : data.message || 'Could not reset your password. Please try again.';
      const am = data.code === 'OTP_EXPIRED_OR_INVALID' || data.code === 'OTP_EXPIRED_OR_USED' || data.code === 'OTP_VERIFICATION_REQUIRED'
        ? 'ይህ ኮድ ጊዜው አልፎበታል ወይም ተጠቅመዋል። አዲስ ኮድ ይጠይቁ።'
        : data.code === 'OTP_ATTEMPTS_EXCEEDED'
          ? 'የተሳሳተ ሙከራ ብዛት አልፏል። አዲስ ኮድ ይጠይቁ።'
          : 'የይለፍ ቃሉን መቀየር አልተቻለም። እባክዎ እንደገና ይሞክሩ።';
      setError(tr(languageMode, en, am));
    } finally {
      setLoading(false);
    }
  }

  function chooseMethod(next) {
    setMethod(next);
    setError('');
    setMessage('');
    setEmailSent(false);
  }

  return (
    <div className="min-h-[65vh] text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 px-6 py-6 sm:px-8">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-400">Recover access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Forgot password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Choose how you want to receive your password reset instructions.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900 p-1.5" role="tablist" aria-label="Password reset method">
            <button type="button" role="tab" aria-selected={method === 'email'} onClick={() => chooseMethod('email')}
              className={'rounded-xl px-3 py-3 text-sm font-semibold transition ' + (method === 'email' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800')}>
              Reset via Email
            </button>
            <button type="button" role="tab" aria-selected={method === 'telegram'} onClick={() => chooseMethod('telegram')}
              className={'rounded-xl px-3 py-3 text-sm font-semibold transition ' + (method === 'telegram' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800')}>
              Telegram Bot OTP
            </button>
          </div>

          {retryStatus ? <div role="status" aria-live="polite" className="mb-5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">{retryStatus}</div> : null}
          {error ? <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {error}
            {telegramBotLink ? <a href={telegramBotLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg border border-sky-400/50 px-3 py-2 font-semibold text-sky-200">{tr(languageMode, 'Open Ahadu Tech Academy bot', 'የአሃዱ ቴክ አካዳሚ ቦትን ክፈት')} ↗</a> : null}
            {error.includes('not linked') || error.includes('አልተገናኘም') ? <Link to="/login" className="ml-2 mt-3 inline-flex rounded-lg border border-slate-500/50 px-3 py-2 font-semibold text-white">{tr(languageMode, 'Sign in to link account', 'መለያዎን ለማገናኘት ይግቡ')}</Link> : null}
          </div> : null}
          {message ? <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Registered email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)}
              disabled={loading || (method === 'email' && emailSent)}
              className={inputClass} placeholder="you@example.com" />
          </label>

          {method === 'email' ? (
            <form onSubmit={sendEmailLink} className="mt-5 space-y-4">
              <button type="submit" disabled={loading || emailSent || !email.trim()} className={buttonClass}>
                {loading ? 'Sending…' : emailSent ? 'Reset link requested' : 'Send reset link'}
              </button>
              <p className="text-xs leading-5 text-slate-500">The email link expires in one hour. If you do not see it, check your spam folder.</p>
            </form>
          ) : (
            <div className="mt-5 space-y-4">
              {!otpSent || remaining === 0 ? (
                <button type="button" onClick={sendTelegramOtp} disabled={loading || !email.trim()} className={buttonClass}>
                  {loading ? tr(languageMode, 'Sending…', 'በመላክ ላይ…') : otpSent ? tr(languageMode, 'Resend New Code', 'አዲስ ኮድ እንደገና ላክ') : tr(languageMode, 'Send OTP to Telegram', 'ኮድን ወደ ቴሌግራም ላክ')}
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3">
                    <span className="text-sm text-slate-300">{tr(languageMode, "Code expires in", "ኮዱ የሚያበቃው በ")}</span>
                    <span className="font-mono text-xl font-bold tabular-nums text-sky-300">{countdown}</span>
                  </div>
                  {telegramBotLink ? <a href={telegramBotLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-xl border border-sky-400/40 px-4 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-400/10">{tr(languageMode, 'Open Telegram bot', 'የቴሌግራም ቦትን ክፈት')} ↗</a> : null}
                  <form onSubmit={resetWithOtp} className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-200">{tr(languageMode, "6-digit Telegram code", "6 አሃዝ ያለው የቴሌግራም ኮድ")}</span>
                      <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={inputClass + ' font-mono tracking-[0.3em]'} placeholder="000000" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-200">New password</span>
                      <input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password}
                        onChange={(event) => setPassword(event.target.value)} className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-200">Confirm new password</span>
                      <input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
                    </label>
                    <button type="submit" disabled={loading || remaining === 0 || otp.length !== 6 || !password || !confirmPassword} className={buttonClass}>
                      {loading ? tr(languageMode, 'Verifying…', 'በማረጋገጥ ላይ…') : tr(languageMode, 'Verify code & save new password', 'ኮዱን አረጋግጥና አዲሱን የይለፍ ቃል አስቀምጥ')}
                    </button>
                  </form>
                  {remaining === 0 ? <p className="text-sm text-amber-300">{tr(languageMode, "This code has expired. Request a new code to continue.", "ይህ ኮድ ጊዜው አልፎበታል። ለመቀጠል አዲስ ኮድ ይጠይቁ።")}</p> : null}
                </>
              )}
              <p className="text-xs leading-5 text-slate-500">{tr(languageMode, "Telegram OTP is bound to your email and current 2-minute window. It can be used once; request a new code when the window expires. A maximum of five incorrect attempts is allowed.", "የቴሌግራም ኮድ ከኢሜይልዎ እና ከአሁኑ የ2 ደቂቃ ጊዜ ጋር ተያይዟል። አንድ ጊዜ ብቻ ይጠቀማል፤ ጊዜው ሲያበቃ አዲስ ኮድ ይጠይቁ። ቢበዛ አምስት የተሳሳቱ ሙከራዎች ይፈቀዳሉ።")}</p>
            </div>
          )}

          <Link to="/login" className="mt-8 block text-center text-sm font-medium text-slate-400 hover:text-white">Return to login</Link>
        </div>
      </div>
    </div>
  );
}
