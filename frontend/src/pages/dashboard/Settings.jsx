
import { useRef, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  applyTheme,
  getSavedTheme,
} from "../../utils/theme";
const rawApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const API = rawApiUrl.endsWith("/api")
  ? rawApiUrl
  : `${rawApiUrl}/api`;
  
const API_BASE = (
  rawApiUrl.replace(/\/+$/, "").endsWith("/api")
    ? rawApiUrl.replace(/\/+$/, "")
    : `${rawApiUrl.replace(/\/+$/, "")}/api`
) || "/api";

const card =
  "rounded-xl border border-slate-800 bg-[#111c30] p-5 md:p-6";

const field =
  "mt-2 w-full rounded-lg border border-slate-700 bg-[#0b1425] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400";

export default function SettingsPage() {
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    photo: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  const [brightness, setBrightness] = useState(
    Number(localStorage.getItem("brightness") || 100)
  );

  // Apply theme and brightness
  function updateAppearance(nextTheme, nextBrightness) {
    setTheme(nextTheme);
    setBrightness(nextBrightness);

    localStorage.setItem("theme", nextTheme);
    localStorage.setItem("brightness", nextBrightness);

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.setProperty(
      "--app-brightness",
      nextBrightness / 100
    );
  }

  // Profile image preview
  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  // Change profile details
  async function saveProfile(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const body = new FormData();
      body.append("name", profile.name);

      if (photoFile) {
        body.append("photo", photoFile);
      }
const response = await fetch(`${API_BASE}/users/me/profile`, {
  method: "PATCH",
  credentials: "include",
  body,
});

      if (!response.ok) {
        throw new Error("Unable to update profile.");
      }

      setMessage("Profile updated successfully.");
      setPhotoFile(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Change email
  async function saveEmail(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/users/me/email`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Unable to update email.");
      }

      setMessage("Email update requested. Check your inbox to verify it.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Change password
  async function savePassword(event) {
    event.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/users/me/password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-slate-100">

      {/* PAGE HEADER */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#111c30] to-[#10152c] p-6 md:p-8">
        <p className="text-xs font-bold tracking-[3px] text-sky-400">
          ACCOUNT PREFERENCES
        </p>

        <h1 className="mt-3 text-2xl font-bold md:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage your profile, password, email and display preferences.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300"
        >
          {message}
        </div>
      )}

      {/* PROFILE SETTINGS */}
      <section className={card}>
        <div className="mb-6 flex items-center gap-3">
          <User className="text-sky-400" />
          <div>
            <h2 className="font-semibold">Profile Information</h2>
            <p className="text-xs text-slate-400">
              Manage your personal information and photo.
            </p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5">
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-sky-500/50 bg-slate-800 text-2xl font-bold">
                {preview || profile.photo ? (
                  <img
                    src={preview || profile.photo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "AD"
                )}
              </div>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-sky-500 p-2 text-white hover:bg-sky-600"
              >
                <Camera size={16} />
              </button>
            </div>

            <div>
              <h3 className="font-semibold">Profile Photo</h3>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or WEBP. Maximum 5 MB.
              </p>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 text-sm font-medium text-sky-400"
              >
                Upload new photo
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Full name
            </label>
            <input
              className={field}
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              placeholder="Enter your full name"
            />
          </div>

          <button
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            <Save size={16} />
            Save Profile
          </button>
        </form>
      </section>

      {/* EMAIL SETTINGS */}
      <section className={card}>
        <div className="mb-5 flex items-center gap-3">
          <Mail className="text-sky-400" />
          <div>
            <h2 className="font-semibold">Email Address</h2>
            <p className="text-xs text-slate-400">
              Change the email associated with your account.
            </p>
          </div>
        </div>

        <form onSubmit={saveEmail}>
          <label className="text-sm text-slate-300">
            New email address
          </label>

          <input
            type="email"
            required
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter new email address"
          />

          <button
            disabled={loading}
            className="mt-4 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Update Email
          </button>
        </form>
      </section>

      {/* PASSWORD SETTINGS */}
      <section className={card}>
        <div className="mb-5 flex items-center gap-3">
          <Lock className="text-sky-400" />
          <div>
            <h2 className="font-semibold">Change Password</h2>
            <p className="text-xs text-slate-400">
              Keep your administrator account secure.
            </p>
          </div>
        </div>

        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">
              Current password
            </label>
            <input
              type="password"
              required
              className={field}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              New password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className={field}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Confirm new password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className={field}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show passwords
          </label>

          <button
            disabled={loading}
            className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* APPEARANCE SETTINGS */}
      <section className={card}>
        <div className="mb-5 flex items-center gap-3">
          <Sun className="text-sky-400" />
          <div>
            <h2 className="font-semibold">Appearance & Brightness</h2>
            <p className="text-xs text-slate-400">
              Customize your dashboard display.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => updateAppearance("dark", brightness)}
            className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm ${
              theme === "dark"
                ? "border-sky-400 bg-sky-500/15 text-sky-300"
                : "border-slate-700 text-slate-400"
            }`}
          >
            <Moon size={17} />
            Dark Mode
          </button>

          <button
  type="button"
  onClick={() => {
    console.log("LIGHT MODE BUTTON CLICKED");

    document.documentElement.setAttribute(
      "data-theme",
      "light"
    );

    document.documentElement.style.colorScheme = "light";

    localStorage.setItem("theme", "light");
  }}
  className="rounded-xl border border-sky-400 bg-sky-500 px-6 py-4 text-white"
>
  Light Mode
</button>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm text-slate-300">
              Screen brightness
            </label>
            <span className="text-sm font-semibold text-sky-400">
              {brightness}%
            </span>
          </div>

          <input
            type="range"
            min="60"
            max="120"
            step="5"
            value={brightness}
            onChange={(e) =>
              updateAppearance(theme, Number(e.target.value))
            }
            className="w-full accent-sky-500"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Dim</span>
            <span>Normal</span>
            <span>Bright</span>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className={card}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" />
          <div>
            <h2 className="font-semibold">Account Security</h2>
            <p className="mt-1 text-xs text-slate-400">
              Password changes should require your current password.
              Email changes should be verified before taking effect.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
