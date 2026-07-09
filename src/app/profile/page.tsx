"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  birthday: string | null;
  role: string;
  created_at: number;
}

interface TopCategory {
  name: string;
  count: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    fetch("/api/auth/profile")
      .then(r => r.json() as Promise<{ user?: UserProfile; topCategories?: TopCategory[]; error?: string }>)
      .then(d => {
        if (d.error || !d.user) { router.push("/"); return; }
        setProfile(d.user);
        setTopCategories(d.topCategories ?? []);
        setDisplayName(d.user.display_name ?? "");
        setBio(d.user.bio ?? "");
        setBirthday(d.user.birthday ?? "");
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, bio, birthday }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Error al guardar."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) return (
    <div style={{ background: "#C0C0C0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Tahoma, sans-serif", fontSize: "12px" }}>
      Cargando...
    </div>
  );

  if (!profile) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'MS Sans Serif', Tahoma, Geneva, sans-serif;
          font-size: 12px;
          background: #C0C0C0;
          min-height: 100vh;
        }
        .profile-header {
          background: #808080;
          border-bottom: 2px solid #fff;
          border-top: 2px solid #404040;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 46px;
        }
        .profile-header-title {
          font-weight: bold;
          font-size: 15px;
          color: white;
          text-shadow: 1px 1px 0 #000;
        }
        .profile-body {
          padding: 20px;
          max-width: 560px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .xp-window {
          background: #D4D0C8;
          border: 2px outset #fff;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
        }
        .xp-title-bar {
          background: linear-gradient(to right, #000080, #1084d0);
          color: white;
          font-weight: bold;
          font-size: 12px;
          padding: 3px 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .xp-form {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .xp-label {
          font-size: 12px;
          display: block;
          margin-bottom: 3px;
          font-weight: bold;
        }
        .xp-label-sub {
          font-size: 11px;
          color: #555;
          font-weight: normal;
          margin-left: 4px;
        }
        .xp-input {
          width: 100%;
          padding: 3px 5px;
          border: 2px inset #808080;
          background: white;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }
        .xp-input:focus { border-color: #000080; }
        .xp-textarea {
          width: 100%;
          padding: 3px 5px;
          border: 2px inset #808080;
          background: white;
          font-family: inherit;
          font-size: 12px;
          outline: none;
          resize: vertical;
          min-height: 70px;
        }
        .xp-btn {
          background: #D4D0C8;
          border: 2px outset #fff;
          padding: 3px 12px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          color: #000;
        }
        .xp-btn:active { border-style: inset; }
        .xp-btn:hover { background: #E0DDD4; }
        .profile-info-row {
          display: flex;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #808080;
          font-size: 12px;
        }
        .profile-info-label { color: #555; min-width: 120px; }
        .profile-info-value { font-weight: bold; }
        .role-badge {
          display: inline-block;
          background: #000080;
          color: white;
          font-size: 10px;
          padding: 1px 6px;
          margin-left: 6px;
        }
        .form-btns {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          padding-top: 4px;
        }
        .success-msg { color: #006600; font-size: 11px; padding: 3px 0; text-align: center; }
        .error-msg { color: #cc0000; font-size: 11px; padding: 3px 0; }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: white;
          text-shadow: 1px 1px 0 #000;
          font-size: 12px;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }
        .back-link:hover { text-decoration: underline; }

        .cat-bar-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          padding: 4px 0;
        }
        .cat-bar-medal { font-size: 16px; flex-shrink: 0; }
        .cat-bar-name { flex: 1; }
        .cat-bar-track {
          width: 80px;
          height: 10px;
          background: #C0C0C0;
          border: 1px inset #808080;
          overflow: hidden;
          flex-shrink: 0;
        }
        .cat-bar-fill {
          height: 100%;
          background: linear-gradient(to right, #000080, #1084d0);
        }
        .cat-bar-count {
          font-size: 10px;
          background: #000080;
          color: white;
          padding: 1px 5px;
          flex-shrink: 0;
          min-width: 28px;
          text-align: center;
        }
      `}</style>

      <div className="profile-header">
        <button className="back-link" onClick={() => router.push("/")}>
          ← Volver al inicio
        </button>
        <span className="profile-header-title">👤 Mi perfil</span>
        <button className="xp-btn" onClick={handleLogout}>Salir</button>
      </div>

      <div className="profile-body">

        {/* Account info */}
        <div className="xp-window">
          <div className="xp-title-bar">
            <span>Información de cuenta</span>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <div className="profile-info-row">
              <span className="profile-info-label">Usuario</span>
              <span className="profile-info-value">
                @{profile.username}
                {profile.role === "admin" && <span className="role-badge">admin</span>}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{profile.email}</span>
            </div>
            <div className="profile-info-row" style={{ borderBottom: "none" }}>
              <span className="profile-info-label">Miembro desde</span>
              <span className="profile-info-value">
                {new Date(profile.created_at * 1000).toLocaleDateString("es-AR", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="xp-window">
          <div className="xp-title-bar">
            <span>✏️ Editar perfil</span>
          </div>
          <div className="xp-form">
            <div>
              <label className="xp-label">
                Nombre para mostrar
                <span className="xp-label-sub">(aparece en imágenes subidas)</span>
              </label>
              <input
                className="xp-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={`@${profile.username}`}
                maxLength={40}
              />
            </div>

            <div>
              <label className="xp-label">Bio</label>
              <textarea
                className="xp-textarea"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Contá algo sobre vos..."
                maxLength={280}
              />
              <div style={{ fontSize: "10px", color: "#888", textAlign: "right", marginTop: "2px" }}>
                {bio.length}/280
              </div>
            </div>

            <div>
              <label className="xp-label">Cumpleaños 🎂</label>
              <input
                className="xp-input"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                style={{ maxWidth: "200px" }}
              />
            </div>

            {error && <div className="error-msg">⚠️ {error}</div>}
            {success && <div className="success-msg">✓ Perfil actualizado.</div>}

            <div className="form-btns">
              <button className="xp-btn" onClick={() => router.push("/")} disabled={saving}>Cancelar</button>
              <button className="xp-btn" onClick={handleSave} disabled={saving} style={{ fontWeight: "bold" }}>
                {saving ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="xp-window">
            <div className="xp-title-bar">
              <span>📊 Categorías más usadas</span>
            </div>
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {topCategories.map((cat, i) => (
                <div key={cat.name} className="cat-bar-row">
                  <span className="cat-bar-medal">{medals[i]}</span>
                  <span className="cat-bar-name">{cat.name}</span>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${(cat.count / topCategories[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="cat-bar-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}