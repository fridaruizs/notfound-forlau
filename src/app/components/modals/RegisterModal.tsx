"use client";
import { useState } from "react";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (user: { id: string; username: string; role: string }) => void;
}

export default function RegisterModal({ onClose, onSuccess }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password) { setError("Completá todos los campos."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password }),
      });
      const data = await res.json() as { user?: { id: string; username: string; role: string }; error?: string };
      if (!res.ok) { setError(data.error ?? "Error al registrarse."); return; }
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
          <span>📝 Registro</span>
          <div className="xp-close" onClick={onClose}>✕</div>
        </div>
        <div className="xp-form">
          <div>
            <label className="xp-label">Nombre de usuario:</label>
            <input
              className="xp-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="xp-label">Email:</label>
            <input
              className="xp-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="xp-label">Contraseña <span style={{opacity:0.5}}>(mín. 8 caracteres)</span>:</label>
            <input
              className="xp-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
            />
          </div>
          {error && <div style={{ color: "#cc0000", fontSize: "11px" }}>⚠️ {error}</div>}
          <div className="xp-form-btns">
            <button className="xp-btn" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="xp-btn" onClick={handleRegister} disabled={loading} style={{ fontWeight: "bold" }}>
              {loading ? "..." : "Registrarse"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}