"use client";
import { useState } from "react";
import { useLang } from "@/app/lib/LangContext";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: { id: string; username: string; role: string }) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) { setError(t("loginFill")); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json() as { user?: { id: string; username: string; role: string }; error?: string };
      if (!res.ok) { setError(data.error ?? t("loginError")); return; }
      onSuccess(data.user!);
      onClose();
    } catch {
      setError(t("loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="xp-window" style={{ width: "100%", maxWidth: "300px" }} onClick={e => e.stopPropagation()}>
        <div className="xp-title-bar">
          <span>🔐 {t("loginTitle")}</span>
          <div className="xp-close" onClick={onClose}>✕</div>
        </div>
        <div className="xp-form">
          <div>
            <label className="xp-label">{t("loginUser")}</label>
            <input className="xp-input" type="text" value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus />
          </div>
          <div>
            <label className="xp-label">{t("loginPass")}</label>
            <input className="xp-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {error && <div style={{ color: "#cc0000", fontSize: "11px" }}>⚠️ {error}</div>}
          <div className="xp-form-btns">
            <button className="xp-btn" onClick={onClose} disabled={loading}>{t("loginCancel")}</button>
            <button className="xp-btn" onClick={handleLogin} disabled={loading} style={{ fontWeight: "bold" }}>
              {loading ? "..." : t("loginSubmit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}