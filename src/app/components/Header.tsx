"use client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  role: string;
}

interface HeaderProps {
  onLogin: () => void;
  onRegister: () => void;
  onUpload: () => void;
  onShuffle: () => void;
  onLogout: () => void;
  user: User | null;
}

export default function Header({ onLogin, onRegister, onUpload, onShuffle, onLogout, user }: HeaderProps) {
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <style>{`
        header {
          background-color: var(--xp-header-bg);
          border-bottom: 2px solid var(--xp-border-light);
          border-top: 2px solid var(--xp-border-dark);
          padding: 6px 10px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          min-height: 46px;
        }
        .header-left { display: flex; gap: 4px; flex-shrink: 0; }
        .header-title {
          font-weight: bold;
          font-size: 16px;
          letter-spacing: 1px;
          color: var(--xp-highlight-text);
          text-shadow: 1px 1px 0 #000;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-right {
          display: flex;
          gap: 4px;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
        }
        .upload-btn {
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          padding: 3px 10px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--xp-text);
          font-weight: bold;
          flex-shrink: 0;
        }
        .upload-btn:active { border-style: inset; }
        .upload-btn:hover { background: var(--xp-btn-hover); }

        .user-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 3px 10px;
          cursor: pointer;
          font-size: 12px;
          color: white;
          text-shadow: 1px 1px 0 #000;
          font-family: inherit;
          white-space: nowrap;
        }
        .user-chip:hover { background: rgba(0,0,0,0.25); }

        @media (max-width: 520px) {
          header { padding: 5px 8px; gap: 6px; }
          .header-title { font-size: 14px; }
          .btn-label { display: none; }
          .icon-btn { width: 30px; height: 26px; font-size: 14px; }
          .xp-btn { padding: 3px 6px; }
          .upload-btn { padding: 3px 6px; }
          .user-chip { padding: 3px 6px; }
        }
        @media (max-width: 360px) {
          .header-title { font-size: 12px; }
        }
      `}</style>
      <header>
        <div className="header-left">
          <button className="icon-btn" title="Orden aleatorio" onClick={onShuffle}>⇄</button>
        </div>

        <span className="header-title">npclvlc</span>

        <div className="header-right">
          {user ? (
            <>
              {isAdmin && (
                <button className="upload-btn" onClick={onUpload}>
                  📤<span className="btn-label">&nbsp;Subir</span>
                </button>
              )}
              <button className="user-chip" onClick={() => router.push("/profile")}>
                👤 {user.username}
              </button>
              <button className="xp-btn" onClick={onLogout}>
                <span className="btn-label">Salir</span>
              </button>
            </>
          ) : (
            <>
              <button className="xp-btn" onClick={onLogin}>
                🔐<span className="btn-label">&nbsp;Iniciar sesión</span>
              </button>
              <button className="xp-btn" onClick={onRegister}>
                📝<span className="btn-label">&nbsp;Registrarse</span>
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
}