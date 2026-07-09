"use client";
import { useState } from "react";
import { useLang } from "@/app/lib/LangContext";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: { id: string; username: string; role: string }) => void;
}

export default function RegisterModal({ onClose, onSuccess }: RegisterModalProps) {
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password) { setError(t("registerFill")); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
      });
      const data = await res.json() as { user?: { id: string; username: string; role: string }; error?: string };
      if (!res.ok) { setError(data.error ?? t("registerFill")); return; }
      onSuccess(data.user!);
      onClose();
    } catch {
      setError(t("registerFill"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="xp-window" style={{ width: "100%", maxWidth: "300px" }} onClick={e => e.stopPropagation()}>
        <div className="xp-title-bar">
          <span>📝 {t("registerTitle")}</span>
          <div className="xp-close" onClick={onClose}>✕</div>
        </div>
        <div className="xp-form">
          <div>
            <label className="xp-label">{t("registerUser")}</label>
            <input className="xp-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="xp-label">{t("registerEmail")}</label>
            <input className="xp-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="xp-label">
              {t("registerPass")} <span style={{ opacity: 0.5 }}>({t("registerPassHint")})</span>
            </label>
            <input className="xp-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()} />
          </div>
          {error && <div style={{ color: "#cc0000", fontSize: "11px" }}>⚠️ {error}</div>}
          <div className="xp-form-btns">
            <button className="xp-btn" onClick={onClose} disabled={loading}>{t("registerCancel")}</button>
            <button className="xp-btn" onClick={handleRegister} disabled={loading} style={{ fontWeight: "bold" }}>
              {loading ? "..." : t("registerSubmit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}