"use client";
import { useState, useEffect } from "react";

const categories = [
  "ver todas",
  "arquitectura",
  "diseño de indumentaria",
  "diseño de interiores",
  "diseño gráfico",
  "escultura",
  "fotografía",
  "ilustración",
  "nostalgia futurista",
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("ver todas");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showBsod, setShowBsod] = useState(true);
  const [bsodDone, setBsodDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBsodDone(true), 2800);
    const t2 = setTimeout(() => setShowBsod(false), 3200);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'MS Sans Serif', Tahoma, Geneva, sans-serif;
          font-size: 13px;
          background-color: #C0C0C0;
          color: #000;
          min-height: 100vh;
        }

        /* BSOD */
        .bsod {
          position: fixed;
          inset: 0;
          background: #0000AA;
          color: #AAAAAA;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          padding: 40px 60px;
          z-index: 9999;
          transition: opacity 0.4s;
          line-height: 1.6;
        }
        .bsod.fade { opacity: 0; }
        .bsod-title {
          background: #AAAAAA;
          color: #0000AA;
          font-weight: bold;
          padding: 2px 8px;
          display: inline-block;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .bsod p { margin-bottom: 12px; color: #AAAAAA; }
        .bsod-bar-wrap {
          margin-top: 20px;
          color: #AAAAAA;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bsod-bar-outer {
          display: inline-block;
          width: 200px;
          height: 14px;
          background: #0000AA;
          border: 1px solid #AAAAAA;
          vertical-align: middle;
        }
        .bsod-bar-inner {
          height: 100%;
          background: #AAAAAA;
          width: 0%;
          animation: bsodload 2.4s linear forwards;
        }
        @keyframes bsodload {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* Header */
        header {
          background-color: #808080;
          border-bottom: 2px solid #fff;
          border-top: 2px solid #404040;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .header-title {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-weight: bold;
          font-size: 16px;
          letter-spacing: 1px;
          color: #fff;
          text-shadow: 1px 1px 0 #000;
        }

        .header-left { display: flex; gap: 4px; }
        .header-right { display: flex; gap: 5px; align-items: center; }

        /* Buttons */
        .xp-btn {
          background-color: #D4D0C8;
          border: 2px outset #ffffff;
          padding: 3px 10px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          color: #000;
        }
        .xp-btn:active { border-style: inset; }
        .xp-btn:hover { background: #E0DDD4; }

        .icon-btn {
          background-color: #D4D0C8;
          border: 2px outset #ffffff;
          width: 36px;
          height: 28px;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
        }
        .icon-btn:active { border-style: inset; }
        .icon-btn:hover { background: #E0DDD4; }

        /* Profile button */
        .profile-btn {
          background-color: #D4D0C8;
          border: 2px outset #ffffff;
          padding: 3px 10px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #000;
        }
        .profile-btn:active { border-style: inset; }

        /* Category bar */
        .category-bar {
          position: relative;
          padding: 5px 10px;
          background: #C0C0C0;
          border-bottom: 1px solid #808080;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .category-toggle {
          background: #D4D0C8;
          border: 2px inset #808080;
          padding: 3px 8px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          min-width: 220px;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: #000;
        }

        .category-dropdown {
          position: absolute;
          top: calc(100% + 1px);
          left: 10px;
          background: #D4D0C8;
          border: 2px outset #ffffff;
          z-index: 100;
          min-width: 220px;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.35);
        }

        .category-option {
          padding: 5px 10px;
          cursor: default;
          font-size: 12px;
          border-bottom: 1px solid #C0C0C0;
          color: #000;
        }
        .category-option:last-child { border-bottom: none; }
        .category-option:hover, .category-option.active {
          background: #000080;
          color: #fff;
        }

        /* Main content */
        .main-content {
          padding: 12px;
          min-height: calc(100vh - 90px);
          background: #C0C0C0;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 12px;
        }

        .empty-folder-img { font-size: 56px; }

        .empty-label {
          font-size: 13px;
          color: #111;
          font-weight: bold;
        }

        .empty-sub {
          font-size: 12px;
          color: #555;
          text-align: center;
          line-height: 1.8;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
        }

        .xp-window {
          background: #C0C0C0;
          border: 2px outset #ffffff;
          min-width: 280px;
          box-shadow: 3px 3px 10px rgba(0,0,0,0.4);
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
          user-select: none;
        }

        .xp-close {
          background: #D4D0C8;
          border: 1px outset #fff;
          width: 16px;
          height: 14px;
          font-size: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: bold;
        }
        .xp-close:active { border-style: inset; }

        .xp-form {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .xp-label {
          font-size: 12px;
          display: block;
          margin-bottom: 3px;
        }

        .xp-input {
          width: 100%;
          padding: 2px 4px;
          border: 2px inset #808080;
          background: white;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }

        .xp-form-btns {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 2px;
        }
      `}</style>

      {/* BSOD Loading screen */}
      {showBsod && (
        <div className={`bsod${bsodDone ? " fade" : ""}`}>
          <div className="bsod-title">Windows</div>
          <p>
            A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +<br />
            00010E36. The current application will be terminated.
          </p>
          <p>
            *  Press any key to terminate the current application.<br />
            *  Press CTRL+ALT+DEL to restart your computer. You will<br />
            &nbsp;&nbsp;&nbsp;lose any unsaved information in all applications.
          </p>
          <p>
            Press any key to continue <span className="blink">_</span>
          </p>
          <div className="bsod-bar-wrap">
            Loading notfound.exe&nbsp;
            <div className="bsod-bar-outer">
              <div className="bsod-bar-inner" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header>
        <div className="header-left">
          <button className="icon-btn" title="Carpeta">🗁</button>
          <button className="icon-btn" title="Recargar" onClick={() => window.location.reload()}>⇄</button>
        </div>

        <span className="header-title">npclvlc</span>

        <div className="header-right">
          <button className="xp-btn" onClick={() => { setLoginOpen(true); setRegisterOpen(false); }}>
            🔐 Iniciar sesión
          </button>
          <button className="xp-btn" onClick={() => { setRegisterOpen(true); setLoginOpen(false); }}>
            📝 Registrarse
          </button>
          <button className="profile-btn">👤 Mi perfil</button>
        </div>
      </header>

      {/* Category bar */}
      <div className="category-bar">
        <button
          className="category-toggle"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span>{activeCategory}</span>
          <span>▾</span>
        </button>
      </div>

      {/* Dropdown outside bar so it overlays content */}
      {menuOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setMenuOpen(false)}
          />
          <div className="category-dropdown" style={{ position: "absolute", top: "90px", left: "10px", zIndex: 100 }}>
            {categories.map(cat => (
              <div
                key={cat}
                className={`category-option${activeCategory === cat ? " active" : ""}`}
                onClick={() => { setActiveCategory(cat); setMenuOpen(false); }}
              >
                {cat}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Main content */}
      <div className="main-content">
        <div className="empty-state">
          <div className="empty-folder-img">📁</div>
          <div className="empty-label">Esta carpeta está vacía.</div>
          <div className="empty-sub">
            No hay imágenes todavía.<br />
            Volvé pronto.
          </div>
        </div>
      </div>

      {/* Login modal */}
      {loginOpen && (
        <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="xp-window" onClick={e => e.stopPropagation()}>
            <div className="xp-title-bar">
              <span>Inicio de Sesión</span>
              <div className="xp-close" onClick={() => setLoginOpen(false)}>✕</div>
            </div>
            <div className="xp-form">
              <div>
                <label className="xp-label">Nombre de usuario:</label>
                <input className="xp-input" type="text" autoFocus />
              </div>
              <div>
                <label className="xp-label">Contraseña:</label>
                <input className="xp-input" type="password" />
              </div>
              <div className="xp-form-btns">
                <button className="xp-btn" onClick={() => setLoginOpen(false)}>Entrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register modal */}
      {registerOpen && (
        <div className="modal-overlay" onClick={() => setRegisterOpen(false)}>
          <div className="xp-window" onClick={e => e.stopPropagation()}>
            <div className="xp-title-bar">
              <span>Registro</span>
              <div className="xp-close" onClick={() => setRegisterOpen(false)}>✕</div>
            </div>
            <div className="xp-form">
              <div>
                <label className="xp-label">Nombre de usuario:</label>
                <input className="xp-input" type="text" autoFocus />
              </div>
              <div>
                <label className="xp-label">Correo electrónico:</label>
                <input className="xp-input" type="email" />
              </div>
              <div>
                <label className="xp-label">Contraseña:</label>
                <input className="xp-input" type="password" />
              </div>
              <div className="xp-form-btns">
                <button className="xp-btn" onClick={() => setRegisterOpen(false)}>Registrarse</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
