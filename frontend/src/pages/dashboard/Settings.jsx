import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, Check, ChevronRight, Eye, EyeOff, Globe2, LockKeyhole,
  Monitor, Moon, Palette, Save, ShieldCheck, Sun, UserRound,
  RefreshCw, Download, Smartphone, Globe, CheckCircle2, AlertTriangle, ExternalLink,
  Copy, Share2, Users, Wallet, Link2,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import { applyTheme, getSavedTheme } from "../../utils/theme";
import { getProfileImageUrl, getProfileInitials } from "../../utils/profile";
import { applyOtaBundle, compareVersions, fetchLatestVersion, getAppVersion, getBuildDate, getCurrentOtaBundleId, getRuntimePlatform, openExternalUpdateUrl, refreshAppShell } from "../../utils/appUpdates";

const tabs = [
  { id: "account", label: "Account & Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Globe2 },
  { id: "updates", label: "App & Web Updates", icon: RefreshCw },
];
const themeOptions = [
  { id: "light", label: "Light", detail: "A bright, clean workspace", icon: Sun },
  { id: "dark", label: "Dark", detail: "A comfortable low-light workspace", icon: Moon },
  { id: "system", label: "System default", detail: "Follow your device preference", icon: Monitor },
];
const fieldClass = "mt-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 disabled:cursor-not-allowed disabled:opacity-70";
const cardClass = "rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-sm sm:p-6";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60";

export default function SettingsPage() {
  const { user, updateProfile } = useContext(AuthContext);
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState("account");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [theme, setTheme] = useState(user?.preferences?.theme || getSavedTheme());
  const [language, setLanguage] = useState(user?.preferences?.language || localStorage.getItem("language") || "en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [telegramLink, setTelegramLink] = useState("");
  const [creatingTelegramLink, setCreatingTelegramLink] = useState(false);
  const [configuredTelegramLink, setConfiguredTelegramLink] = useState("");
  const [telegramLinkDraft, setTelegramLinkDraft] = useState("");
  const [loadingTelegramSettings, setLoadingTelegramSettings] = useState(false);
  const [savingTelegramSettings, setSavingTelegramSettings] = useState(false);
  const [editingTelegramLink, setEditingTelegramLink] = useState(false);
  const [payoutAccount, setPayoutAccount] = useState({ provider: '', accountName: '', accountNumber: '' });
  const [savingPayout, setSavingPayout] = useState(false);
  const [referralData, setReferralData] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [referralError, setReferralError] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const isAdmin = user?.role === "admin";
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [latestVersion, setLatestVersion] = useState(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [applyingUpdate, setApplyingUpdate] = useState(false);
  const [updateCheckedAt, setUpdateCheckedAt] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [nativeVersion, setNativeVersion] = useState("");
  const [otaUpdateAvailable, setOtaUpdateAvailable] = useState(false);
  const currentVersion = getAppVersion();
  const platform = getRuntimePlatform();
  const isNativeApp = platform !== "web";
  const nativeBinaryUpdateRequired = isNativeApp && latestVersion?.nativeUpdateRequired === true;
  const nativeDownloadUrl = platform === "ios" ? latestVersion?.iosUpdateUrl : latestVersion?.androidUpdateUrl;

  useEffect(() => {
    let active = true;
    api.get('/referrals/mine')
      .then((response) => {
        if (!active) return;
        setReferralData(response.data);
        setReferralError("");
        setPayoutAccount({
          provider: response.data?.payoutAccount?.provider || '',
          accountName: response.data?.payoutAccount?.accountName || '',
          accountNumber: response.data?.payoutAccount?.accountNumber || '',
        });
      })
      .catch((error) => {
        if (active) setReferralError(error.response?.data?.message || "Referral information is temporarily unavailable.");
      })
      .finally(() => { if (active) setLoadingReferral(false); });
    setLoadingTelegramSettings(true);
    api.get("/settings/telegram-link")
      .then((response) => {
        if (!active) return;
        const link = response.data?.telegramLink || "";
        setConfiguredTelegramLink(link);
        setTelegramLinkDraft(link);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoadingTelegramSettings(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setFullName(user?.fullName || "");
    if (user?.preferences?.theme) setTheme(user.preferences.theme);
    if (user?.preferences?.language) setLanguage(user.preferences.language);
  }, [user]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const photoUrl = useMemo(() => photoPreview || getProfileImageUrl(user), [photoPreview, user]);

  useEffect(() => {
    setPhotoLoadFailed(false);
  }, [photoUrl]);

  function showNotice(type, text) {
    setNotice({ type, text });
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      showNotice("error", "Choose a JPG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotice("error", "Your profile photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoLoadFailed(false);
    setPhotoPreview(URL.createObjectURL(file));
    showNotice("", "");
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      showNotice("error", "Please enter a name with at least 2 characters.");
      return;
    }
    setSavingProfile(true);
    showNotice("", "");
    try {
      const form = new FormData();
      form.append("fullName", fullName.trim());
      form.append("theme", theme);
      form.append("language", language);
      if (photoFile) form.append("profilePhoto", photoFile);
      const result = await updateProfile(form);
      // Keep the selected preview visible until the server-returned persistent URL
      // is available, then switch the avatar to that saved URL immediately.
      if (photoFile) {
        const savedPhotoUrl = getProfileImageUrl(result?.user);
        if (!savedPhotoUrl) {
          throw new Error("The server saved the profile update but did not return a profile photo URL. Please try again.");
        }
        setPhotoPreview(savedPhotoUrl);
        setPhotoLoadFailed(false);
      } else {
        setPhotoPreview("");
      }
      setPhotoFile(null);
      showNotice("success", "Your profile has been updated.");
    } catch (error) {
      showNotice("error", error.response?.data?.message || "Unable to save your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePreferences(nextValues = {}) {
    const nextTheme = nextValues.theme || theme;
    const nextLanguage = nextValues.language || language;
    setSavingPreferences(true);
    showNotice("", "");
    try {
      await updateProfile({ theme: nextTheme, language: nextLanguage });
      localStorage.setItem("language", nextLanguage);
      applyTheme(nextTheme);
      showNotice("success", "Your preferences have been saved.");
    } catch (error) {
      showNotice("error", error.response?.data?.message || "Unable to save your preferences.");
    } finally {
      setSavingPreferences(false);
    }
  }

  function selectTheme(value) {
    setTheme(value);
    applyTheme(value);
    savePreferences({ theme: value });
  }

  function selectLanguage(value) {
    setLanguage(value);
    localStorage.setItem("language", value);
    savePreferences({ language: value });
  }

  function getReferralShareUrl() {
    const value = String(referralData?.referralLink || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return window.location.origin.replace(/\/$/, "") + (value.startsWith("/") ? value : "/" + value);
  }

  async function copyReferralLink() {
    const link = getReferralShareUrl();
    if (!link) {
      showNotice("error", "Your referral link is not ready yet. Refresh Settings and try again.");
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const field = document.createElement("textarea");
        field.value = link;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy is not available in this browser.");
      }
      setReferralCopied(true);
      showNotice("success", "Referral link copied. Share it with your friends.");
    } catch (error) {
      showNotice("error", error.message || "Unable to copy your referral link.");
    }
  }

  async function shareReferralLink() {
    const link = getReferralShareUrl();
    if (!link) {
      showNotice("error", "Your referral link is not ready yet. Refresh Settings and try again.");
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join Ahadu Tech Academy", text: "Register with my Ahadu Tech Academy referral link.", url: link });
      } else {
        await copyReferralLink();
      }
    } catch (error) {
      if (error?.name !== "AbortError") await copyReferralLink();
    }
  }

  async function savePayoutAccount(event) {
    event.preventDefault();
    setSavingPayout(true);
    try {
      await api.put('/referrals/payout', payoutAccount);
      showNotice('success', 'Your payout account has been saved securely.');
    } catch (error) {
      showNotice('error', error.response?.data?.message || 'Unable to save your payout account.');
    } finally { setSavingPayout(false); }
  }

  async function saveTelegramBotLink(event) {
    event.preventDefault();
    setSavingTelegramSettings(true);
    showNotice("", "");
    try {
      const response = await api.put("/settings/telegram-link", { telegramLink: telegramLinkDraft });
      const saved = response.data?.telegramLink || telegramLinkDraft;
      setConfiguredTelegramLink(saved);
      setTelegramLinkDraft(saved);
      setEditingTelegramLink(false);
      showNotice("success", "Telegram bot link saved for all users.");
    } catch (error) {
      showNotice("error", error.response?.data?.message || "Unable to save the Telegram bot link.");
    } finally {
      setSavingTelegramSettings(false);
    }
  }

  async function createTelegramLink() {
    setCreatingTelegramLink(true);
    setTelegramLink("");
    showNotice("", "");
    try {
      const response = await api.post("/auth/telegram/link/request");
      setTelegramLink(response.data?.telegramLink || "");
      showNotice("success", response.data?.message || "Open Telegram to link your account.");
    } catch (error) {
      showNotice("error", error.response?.data?.message || "Unable to create a Telegram link.");
    } finally {
      setCreatingTelegramLink(false);
    }
  }


  async function checkForUpdates() {
    setCheckingUpdates(true);
    setUpdateError("");
    try {
      const metadata = await fetchLatestVersion();
      setLatestVersion(metadata);
      setUpdateCheckedAt(new Date().toLocaleString());
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (registration) await registration.update().catch(() => undefined);
      }
      let hasOtaUpdate = false;
      if (isNativeApp && metadata.bundleId && metadata.bundleUrl && metadata.checksum) {
        const currentBundleId = await getCurrentOtaBundleId().catch(() => null);
        hasOtaUpdate = currentBundleId !== metadata.bundleId;
      }
      setOtaUpdateAvailable(hasOtaUpdate);
      const appUpdateAvailable = compareVersions(metadata.version, currentVersion) > 0 || Boolean(metadata.forceRefresh) || hasOtaUpdate;
      const nativeUpdateAvailable = isNativeApp && metadata.nativeUpdateRequired === true;
      showNotice("success", appUpdateAvailable || nativeUpdateAvailable ? "An update is available." : "You're using the latest available app version.");
      return metadata;
    } catch (error) {
      setUpdateError(error.message || "Unable to check for updates. Check your internet connection and try again.");
      showNotice("error", "Could not check for updates. Your saved offline materials and account data are unchanged.");
      return null;
    } finally {
      setCheckingUpdates(false);
    }
  }

  async function updateNow() {
    setApplyingUpdate(true);
    setUpdateError("");
    showNotice("", "");
    try {
      // Always fetch the manifest at click time so this is a true one-tap flow.
      const metadata = await fetchLatestVersion();
      setLatestVersion(metadata);
      setUpdateCheckedAt(new Date().toLocaleString());

      if (isNativeApp && metadata.bundleId && metadata.bundleUrl) {
        await applyOtaBundle(metadata);
        return;
      }

      if (isNativeApp && metadata.nativeUpdateRequired === true) {
        setUpdateError("A native app update is required. Use Download Latest APK below.");
        return;
      }

      await refreshAppShell();
    } catch (error) {
      setUpdateError(error.message || "The update could not be completed. Check your connection and try again.");
      showNotice("error", "Update failed. Your sign-in information and downloaded offline study materials have not been cleared.");
    } finally {
      setApplyingUpdate(false);
    }
  }

  async function downloadLatestApk() {
    if (!nativeDownloadUrl) {
      setUpdateError("The native app download link has not been configured yet.");
      return;
    }
    try {
      await openExternalUpdateUrl(nativeDownloadUrl);
      showNotice("success", "Opened the official app download page.");
    } catch (error) {
      setUpdateError(error.message || "Unable to open the app download link.");
    }
  }

  useEffect(() => {
    if (!isNativeApp) return undefined;
    let active = true;
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (typeof appPlugin?.getInfo === "function") {
      appPlugin.getInfo().then((info) => {
        if (active) setNativeVersion(info?.version || "");
      }).catch(() => undefined);
    }
    return () => { active = false; };
  }, [isNativeApp]);

  async function changePassword(event) {
    event.preventDefault();
    showNotice("", "");
    if (newPassword.length < 8) {
      showNotice("error", "Your new password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotice("error", "The new password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const response = await api.patch("/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotice("success", response.data?.message || "Your password has been changed.");
    } catch (error) {
      showNotice("error", error.response?.data?.message || "Unable to change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 text-[var(--app-text)]">
      <header className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-gradient-to-br from-sky-600/15 via-[var(--app-card)] to-[var(--app-card)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-500">Workspace preferences</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-muted)]">
              Manage your account details, security, display, and language preferences.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-500 sm:block">
            <ShieldCheck size={30} />
          </div>
        </div>
      </header>


      <section className={cardClass} aria-labelledby="settings-referral-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Invite & earn</p>
            <h2 id="settings-referral-heading" className="mt-2 text-xl font-bold">Referral Link</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--app-muted)]">Invite learners to Ahadu Tech Academy. Commissions are counted only after an administrator verifies a premium-course payment receipt and approves access.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600"><Link2 size={14}/> Your personal link</span>
        </div>

        {referralError && <p role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">{referralError}</p>}
        {loadingReferral ? <p className="mt-5 text-sm text-[var(--app-muted)]">Loading your referral link and statistics…</p> : (
          <>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input aria-label="Your personal referral link" readOnly value={getReferralShareUrl()} placeholder="Your referral link will appear here" className={fieldClass + " min-w-0 flex-1"} />
              <button type="button" onClick={copyReferralLink} disabled={!referralData?.referralLink} className={buttonClass}><Copy size={16}/>{referralCopied ? "Copied" : "Copy link"}</button>
              <button type="button" onClick={shareReferralLink} disabled={!referralData?.referralLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-50"><Share2 size={16}/>Share</button>
            </div>
            {referralData?.referralCode && <p className="mt-2 text-xs text-[var(--app-muted)]">Referral code: <span className="font-semibold tracking-wider">{referralData.referralCode}</span></p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"><div className="flex items-center gap-2 text-sm text-[var(--app-muted)]"><Users size={16}/>Direct referrals</div><p className="mt-2 text-2xl font-bold tabular-nums">{referralData?.counts?.direct ?? 0}</p></div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"><div className="flex items-center gap-2 text-sm text-[var(--app-muted)]"><Users size={16}/>Second-level+ referrals</div><p className="mt-2 text-2xl font-bold tabular-nums">{referralData?.counts?.indirect ?? 0}</p><p className="mt-1 text-xs text-[var(--app-muted)]">All levels below direct</p></div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"><div className="flex items-center gap-2 text-sm text-[var(--app-muted)]"><Wallet size={16}/>Total earned</div><p className="mt-2 text-2xl font-bold tabular-nums">{new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number(referralData?.earningsETB || 0))}</p><p className="mt-1 text-xs text-[var(--app-muted)]">Verified premium payments only</p></div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"><div className="flex items-center gap-2 text-sm text-[var(--app-muted)]"><Wallet size={16}/>Paid out / sent</div><p className="mt-2 text-2xl font-bold tabular-nums">{new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number(referralData?.paidOutETB || 0))}</p><p className="mt-1 text-xs text-[var(--app-muted)]">Recorded by an administrator</p></div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4"><div className="flex items-center gap-2 text-sm text-[var(--app-muted)]"><Wallet size={16}/>Remaining balance</div><p className="mt-2 text-2xl font-bold tabular-nums">{new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number(referralData?.remainingBalanceETB || 0))}</p><p className="mt-1 text-xs text-[var(--app-muted)]">Earned minus paid out</p></div>
            </div>
          </>
        )}

        <div className="mt-6 border-t border-[var(--app-border)] pt-5">
          <h3 className="text-base font-bold">Payout account</h3>
          <p className="mt-1 text-sm text-[var(--app-muted)]">Add the bank or mobile-wallet details where your eligible referral commissions can be paid.</p>
          <form onSubmit={savePayoutAccount} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Bank or wallet provider<input className={fieldClass} value={payoutAccount.provider} onChange={event => setPayoutAccount(prev => ({ ...prev, provider: event.target.value }))} placeholder="e.g. CBE, Telebirr" required maxLength={60}/></label>
            <label className="text-sm font-semibold">Account holder name<input className={fieldClass} value={payoutAccount.accountName} onChange={event => setPayoutAccount(prev => ({ ...prev, accountName: event.target.value }))} required maxLength={120}/></label>
            <label className="text-sm font-semibold sm:col-span-2">Account or wallet number<input className={fieldClass} value={payoutAccount.accountNumber} onChange={event => setPayoutAccount(prev => ({ ...prev, accountNumber: event.target.value }))} required maxLength={80} autoComplete="off"/></label>
            <div className="sm:col-span-2"><button type="submit" disabled={savingPayout} className={buttonClass}><Save size={16}/>{savingPayout ? "Saving…" : "Save payout account"}</button></div>
          </form>
        </div>
      </section>

      {notice.text && (
        <div role="status" className={"rounded-xl border px-4 py-3 text-sm " + (notice.type === "error" ? "border-rose-500/30 bg-rose-500/10 text-rose-600" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600")}>
          {notice.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-2 md:block md:space-y-1 md:self-start">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={selected ? "page" : undefined}
                className={"flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition md:w-full " + (selected ? "bg-sky-500/10 text-sky-600" : "text-[var(--app-muted)] hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]")}>
                <Icon size={18} />
                <span>{tab.label}</span>
                {selected && <ChevronRight className="ml-auto hidden md:block" size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-6">
          {activeTab === "account" && (
            <>
              <section className={cardClass}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold">Profile information</h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Update the name and photo shown across Ahadu Tech Academy.</p>
                </div>
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] text-2xl font-bold text-sky-600">
                        {photoUrl && !photoLoadFailed ? (
                          <img
                            src={photoUrl}
                            alt="Your profile"
                            className="h-full w-full object-cover"
                            onError={() => setPhotoLoadFailed(true)}
                          />
                        ) : getProfileInitials(fullName)}
                      </div>
                      <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload profile photo" className="absolute -bottom-2 -right-2 rounded-xl border-2 border-[var(--app-card)] bg-sky-600 p-2 text-white shadow transition hover:bg-sky-500">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold">Profile photo</p>
                      <p className="mt-1 text-xs text-[var(--app-muted)]">JPG, PNG, WebP or GIF · up to 5 MB</p>
                      <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm font-semibold text-sky-600 hover:text-sky-500">Choose a photo</button>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={choosePhoto} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="settings-name" className="text-sm font-semibold">Display name</label>
                    <input id="settings-name" className={fieldClass} value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={120} required autoComplete="name" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="settings-email" className="text-sm font-semibold">Email address</label>
                      <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-muted)]">Read only</span>
                    </div>
                    <input id="settings-email" className={fieldClass} value={user?.email || ""} readOnly disabled autoComplete="email" />
                    <p className="mt-2 text-xs text-[var(--app-muted)]">Email address can only be changed by an administrator.</p>
                  </div>
                  <button type="submit" disabled={savingProfile} className={buttonClass}>
                    <Save size={16} /> {savingProfile ? "Saving…" : "Save profile"}
                  </button>
                </form>
                <div className="mt-6 border-t border-[var(--app-border)] pt-5">
                  <h3 className="text-sm font-bold">Telegram account</h3>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">Link your Telegram account securely so you can receive one-minute password reset codes.</p>
                  <button type="button" onClick={createTelegramLink} disabled={creatingTelegramLink} className={buttonClass + " mt-4"}>
                    {creatingTelegramLink ? "Preparing Telegram link…" : "Link Telegram account"}
                  </button>
                  {configuredTelegramLink && (
                    <a href={configuredTelegramLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-xl border border-sky-500/40 px-4 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-500/10">
                      Open Ahadu Tech Academy Telegram bot
                    </a>
                  )}
                  {telegramLink && (
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-xl border border-sky-500/40 px-4 py-3 text-sm font-semibold text-sky-600 hover:bg-sky-500/10">
                      Open Telegram bot to finish linking
                    </a>
                  )}
                </div>
                {isAdmin && (
                  <div className="mt-6 border-t border-[var(--app-border)] pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold">Change the Telegram Bot Links</h3>
                        <p className="mt-1 text-sm text-[var(--app-muted)]">Manage the public Telegram bot link used by users across the app.</p>
                      </div>
                      <button type="button" onClick={() => { setTelegramLinkDraft(configuredTelegramLink); setEditingTelegramLink((value) => !value); }} className="inline-flex items-center gap-2 rounded-xl border border-sky-500/40 px-4 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-500/10">
                        {editingTelegramLink ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {editingTelegramLink && (
                      <form onSubmit={saveTelegramBotLink} className="mt-4">
                        <label htmlFor="settings-telegram-bot-link" className="block text-sm font-semibold">Telegram bot username or link</label>
                        <input id="settings-telegram-bot-link" className={fieldClass} value={telegramLinkDraft} onChange={(event) => setTelegramLinkDraft(event.target.value)} placeholder="@YourAcademyBot or https://t.me/YourAcademyBot" autoComplete="url" />
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <button type="submit" disabled={savingTelegramSettings || loadingTelegramSettings || !telegramLinkDraft.trim()} className={buttonClass}>
                            <Save size={16} /> {savingTelegramSettings ? "Saving…" : "Save Telegram link"}
                          </button>
                          {configuredTelegramLink && <a href={configuredTelegramLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-sky-600 hover:underline">Test saved link</a>}
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </section>


              <section className={cardClass}>
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600"><LockKeyhole size={19} /></div>
                  <div>
                    <h2 className="text-lg font-bold">Password & security</h2>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">Confirm your current password before choosing a new one.</p>
                  </div>
                </div>
                <form onSubmit={changePassword} className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="text-sm font-semibold">Current password</label>
                    <input id="current-password" type={showPasswords ? "text" : "password"} className={fieldClass} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="new-password" className="text-sm font-semibold">New password</label>
                      <input id="new-password" type={showPasswords ? "text" : "password"} className={fieldClass} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="text-sm font-semibold">Confirm new password</label>
                      <input id="confirm-password" type={showPasswords ? "text" : "password"} className={fieldClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" />
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--app-muted)]">
                    <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} className="rounded border-[var(--app-border)] text-sky-600 focus:ring-sky-500" />
                    Show password fields
                  </label>
                  <div>
                    <button type="submit" disabled={savingPassword} className={buttonClass}>
                      <LockKeyhole size={16} /> {savingPassword ? "Updating…" : "Update password"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}

          {activeTab === "appearance" && (
            <section className={cardClass}>
              <div className="mb-6">
                <h2 className="text-lg font-bold">Appearance</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Choose how Ahadu Tech Academy looks on this device.</p>
              </div>
              <div className="space-y-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.id;
                  return (
                    <button key={option.id} type="button" onClick={() => selectTheme(option.id)} disabled={savingPreferences}
                      className={"flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition " + (selected ? "border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/10" : "border-[var(--app-border)] hover:border-sky-500/50")}>
                      <span className={"rounded-xl p-3 " + (selected ? "bg-sky-500/10 text-sky-600" : "bg-[var(--app-bg)] text-[var(--app-muted)]")}><Icon size={20} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs text-[var(--app-muted)]">{option.detail}</span>
                      </span>
                      {selected && <Check size={19} className="text-sky-600" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 text-xs text-[var(--app-muted)]">System default follows your operating system’s light or dark appearance setting.</p>
            </section>
          )}


          {activeTab === "updates" && (
            <section className={cardClass}>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-sky-500/10 p-2.5 text-sky-600"><RefreshCw size={19} /></span>
                    <h2 className="text-lg font-bold">App & Web Updates</h2>
                  </div>
                  <p className="mt-2 text-sm text-[var(--app-muted)]">Check for the latest Ahadu Tech Academy application and website version.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold">
                  {isNativeApp ? <Smartphone size={14} /> : <Globe size={14} />}
                  {isNativeApp ? `Mobile app · ${platform}` : "Web / PWA"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                  <p className="text-xs font-medium text-[var(--app-muted)]">Current loaded version</p>
                  <p className="mt-1 text-xl font-bold">{currentVersion}</p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">Build: {getBuildDate()}</p>
                  {nativeVersion && <p className="mt-1 text-xs text-[var(--app-muted)]">Installed native build: {nativeVersion}</p>}
                </div>
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                  <p className="text-xs font-medium text-[var(--app-muted)]">Latest published version</p>
                  <p className="mt-1 text-xl font-bold">{latestVersion?.version || "Not checked yet"}</p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">
                    {latestVersion
                      ? (compareVersions(latestVersion.version, currentVersion) > 0 || latestVersion.forceRefresh || otaUpdateAvailable
                        ? "Update available"
                        : "No newer web version found")
                      : "Check online to get the latest version"}
                  </p>
                </div>
              </div>

              {latestVersion?.releaseNotes && (
                <div className="mt-4 rounded-xl border border-[var(--app-border)] p-4">
                  <p className="text-sm font-semibold">What's new</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-[var(--app-muted)]">{latestVersion.releaseNotes}</p>
                </div>
              )}

              {nativeBinaryUpdateRequired && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">A mobile app installation update is required.</p>
                    <p className="mt-1">Refreshing the web content cannot replace the installed Android/iOS application binary.</p>
                  </div>
                </div>
              )}

              {updateError && <p role="alert" className="mt-4 text-sm text-rose-600">{updateError}</p>}
              {updateCheckedAt && <p className="mt-3 text-xs text-[var(--app-muted)]">Last checked: {updateCheckedAt}</p>}

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://github.com/derbewmolla14/Ahadu-tech-academys/releases/download/v1.0.3-mobile-ui/Ahadu-Tech-Academy.apk"
                  className="${buttonClass}"
                  aria-label="Download Ahadu Tech Academy APK"
                >
                  <Download size={16} /> Download Ahadu Tech Academy APK
                </a>
                <button type="button" onClick={checkForUpdates} disabled={checkingUpdates || applyingUpdate} className={buttonClass}>
                  <RefreshCw size={16} className={checkingUpdates ? "animate-spin" : ""} />
                  {checkingUpdates ? "Checking…" : "Check for Updates"}
                </button>
                <button type="button" onClick={updateNow} disabled={applyingUpdate || checkingUpdates || (isNativeApp && !otaUpdateAvailable)} className={buttonClass}>
                  {applyingUpdate ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  {applyingUpdate ? "Applying OTA update…" : "Update Now"}
                </button>
                {isNativeApp && nativeDownloadUrl && (
                  <button type="button" onClick={downloadLatestApk} className={buttonClass}>
                    <ExternalLink size={16} /> Download Latest {platform === "ios" ? "App" : "APK"}
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--app-muted)]">
                OTA updates replace only the web bundle. Your sign-in session, profile data, and downloaded offline study materials are preserved. Native Android/iOS code or permission changes still require a separately published app update.
              </p>
            </section>
          )}

          {activeTab === "language" && (
            <section className={cardClass}>
              <div className="mb-6">
                <h2 className="text-lg font-bold">Language</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Select your preferred platform language.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => selectLanguage("en")} disabled={savingPreferences}
                  className={"rounded-2xl border p-5 text-left transition " + (language === "en" ? "border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/10" : "border-[var(--app-border)] hover:border-sky-500/50")}>
                  <span className="block text-lg font-bold">English</span>
                  <span className="mt-1 block text-xs text-[var(--app-muted)]">English</span>
                  {language === "en" && <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-600"><Check size={14} /> Selected</span>}
                </button>
                <button type="button" onClick={() => selectLanguage("am")} disabled={savingPreferences}
                  className={"rounded-2xl border p-5 text-left transition " + (language === "am" ? "border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/10" : "border-[var(--app-border)] hover:border-sky-500/50")}>
                  <span className="block text-lg font-bold">አማርኛ</span>
                  <span className="mt-1 block text-xs text-[var(--app-muted)]">Amharic</span>
                  {language === "am" && <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-600"><Check size={14} /> ተመርጧል</span>}
                </button>
              </div>
              <p className="mt-5 text-xs text-[var(--app-muted)]">Your language preference is saved to your account. Some platform sections may remain in English until their translations are added.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
