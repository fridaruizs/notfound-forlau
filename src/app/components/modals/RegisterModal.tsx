"use client";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="xp-window" style={{ width: "100%", maxWidth: "300px" }} onClick={e => e.stopPropagation()}>
        <div className="xp-title-bar">
          <span>Registro</span>
          <div className="xp-close" onClick={onClose}>✕</div>
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
            <button className="xp-btn" onClick={onClose}>Registrarse</button>
          </div>
        </div>
      </div>
    </div>
  );
}