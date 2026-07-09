"use client";
import { useState } from "react";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: { id: string; username: string; role: string }) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) { setError("Completá todos los campos."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json() as { user?: { id: string; username: string; role: string }; error?: string };
      if (!res.ok) { setError(data.error ?? "Error al iniciar sesión."); return; }
      onSuccess(data.user!);
      onClose();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="xp-window" style={{ width: "100%", maxWidth: "300px" }} onClick={e => e.stopPropagation()}>
        <div className="xp-title-bar">
          <span>🔐 Inicio de Sesión</span>
          <div className="xp-close" onClick={onClose}>✕</div>
        </div>
        <div className="xp-form">
          <div>
            <label className="xp-label">Usuario o email:</label>
            <input
              className="xp-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>
          <div>
            <label className="xp-label">Contraseña:</label>
            <input
              className="xp-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          {error && <div style={{ color: "#cc0000", fontSize: "11px" }}>⚠️ {error}</div>}
          <div className="xp-form-btns">
            <button className="xp-btn" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="xp-btn" onClick={handleLogin} disabled={loading} style={{ fontWeight: "bold" }}>
              {loading ? "..." : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}