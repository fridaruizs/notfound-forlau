"use client";
import { useState, useEffect, useRef } from "react";

interface Category {
  id: string;
  name: string;
  protected: number;
}

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  authorId: string;
}

export default function UploadModal({ onClose, onSuccess, authorId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json() as Promise<{ categories?: Category[] }>)
      .then(d => { if (d.categories) setCategories(d.categories.filter(c => !c.protected)); })
      .catch(() => {});
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Solo se permiten imágenes."); return; }
    if (f.size > 10 * 1024 * 1024) { setError("Archivo demasiado grande. Máx 10MB."); return; }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!file) { setError("Seleccioná una imagen."); return; }
    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim() || file.name);
      if (description.trim()) formData.append("description", description.trim());
      if (sourceUrl.trim()) formData.append("source_url", sourceUrl.trim());
      formData.append("visibility", visibility);
      formData.append("author_id", authorId);
      selectedCategories.forEach(id => formData.append("category_ids", id));

      setProgress(30);

      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Error al subir");
      }

      setProgress(100);
      setTimeout(() => { onSuccess(); onClose(); }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <>
      <style>{`
        .upload-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.25);
          display: flex; align-items: center; justify-content: center;
          z-index: 500; padding: 16px;
        }
        .upload-window {
          background: var(--xp-bg);
          border: 2px outset var(--xp-border-light);
          box-shadow: 3px 3px 10px var(--xp-shadow);
          width: 100%; max-width: 520px; max-height: 90vh;
          display: flex; flex-direction: column;
        }
        .upload-body {
          padding: 12px 14px;
          display: flex; flex-direction: column; gap: 10px;
          overflow-y: auto;
        }
        .upload-row { display: flex; flex-direction: column; gap: 3px; }
        .upload-row-inline { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .drop-zone {
          border: 2px inset var(--xp-border-mid);
          background: white; min-height: 120px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; position: relative; overflow: hidden;
        }
        .drop-zone:hover { background: #f8f8f8; }
        .drop-zone img { max-width: 100%; max-height: 180px; object-fit: contain; display: block; }
        .drop-zone-placeholder {
          text-align: center; color: var(--xp-text-muted);
          font-size: 12px; padding: 16px; pointer-events: none;
        }
        .drop-zone-placeholder div:first-child { font-size: 28px; margin-bottom: 6px; }
        .category-chips {
          display: flex; flex-wrap: wrap; gap: 4px; padding: 4px;
          border: 2px inset var(--xp-border-mid); background: white; min-height: 32px;
        }
        .chip {
          background: var(--xp-btn); border: 1px outset var(--xp-border-light);
          padding: 2px 7px; font-size: 11px; cursor: pointer;
          font-family: inherit; color: var(--xp-text); white-space: nowrap;
        }
        .chip:active { border-style: inset; }
        .chip.selected { background: var(--xp-highlight); color: var(--xp-highlight-text); border-color: var(--xp-highlight); }
        .upload-progress {
          height: 16px; background: white;
          border: 2px inset var(--xp-border-mid); overflow: hidden;
        }
        .upload-progress-bar {
          height: 100%;
          background: linear-gradient(to right, var(--xp-titlebar-start), var(--xp-titlebar-end));
          transition: width 0.3s;
        }
        .upload-footer {
          padding: 8px 14px; border-top: 1px solid var(--xp-border-mid);
          display: flex; justify-content: flex-end; gap: 6px; background: var(--xp-bg);
        }
        .upload-error { color: #cc0000; font-size: 11px; padding: 3px 0; }
        .visibility-row { display: flex; gap: 12px; align-items: center; font-size: 12px; }
        .visibility-row label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
        @media (max-width: 540px) {
          .upload-row-inline { grid-template-columns: 1fr; }
          .upload-window { max-width: 100%; }
        }
      `}</style>

      <div className="upload-overlay" onClick={onClose}>
        <div className="upload-window" onClick={e => e.stopPropagation()}>
          <div className="xp-title-bar">
            <span>📤 Subir imagen</span>
            <div className="xp-close" onClick={onClose}>✕</div>
          </div>

          <div className="upload-body">
            <div className="upload-row">
              <label className="xp-label">Archivo *</label>
              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                {preview
                  ? <img src={preview} alt="preview" />
                  : (
                    <div className="drop-zone-placeholder">
                      <div>🖼️</div>
                      <div>Hacé clic o arrastrá una imagen aquí</div>
                      <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.6 }}>JPG, PNG, GIF, WEBP · máx 10MB</div>
                    </div>
                  )
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            <div className="upload-row-inline">
              <div className="upload-row">
                <label className="xp-label">Título</label>
                <input className="xp-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="título de la imagen..." />
              </div>
              <div className="upload-row">
                <label className="xp-label">Visibilidad</label>
                <div className="visibility-row">
                  <label><input type="radio" name="visibility" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} /> público</label>
                  <label><input type="radio" name="visibility" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} /> privado</label>
                </div>
              </div>
            </div>

            <div className="upload-row">
              <label className="xp-label">Descripción <span style={{ opacity: 0.5 }}>(opcional)</span></label>
              <textarea className="xp-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="descripción..." rows={2} />
            </div>

            <div className="upload-row">
              <label className="xp-label">Fuente / link original <span style={{ opacity: 0.5 }}>(opcional)</span></label>
              <input className="xp-input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." type="url" />
            </div>

            <div className="upload-row">
              <label className="xp-label">Categorías <span style={{ opacity: 0.5 }}>(seleccioná una o más)</span></label>
              <div className="category-chips">
                {categories.length === 0
                  ? <span style={{ fontSize: "11px", color: "#888", padding: "2px 4px" }}>Cargando categorías...</span>
                  : categories.map(cat => (
                    <button key={cat.id} className={`chip${selectedCategories.includes(cat.id) ? " selected" : ""}`} onClick={() => toggleCategory(cat.id)} type="button">
                      {selectedCategories.includes(cat.id) ? "✓ " : ""}{cat.name}
                    </button>
                  ))
                }
              </div>
            </div>

            {uploading && (
              <div className="upload-row">
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {error && <div className="upload-error">⚠️ {error}</div>}
          </div>

          <div className="upload-footer">
            <button className="xp-btn" onClick={onClose} disabled={uploading}>Cancelar</button>
            <button className="xp-btn" onClick={handleSubmit} disabled={uploading || !file} style={{ fontWeight: "bold" }}>
              {uploading ? "Subiendo..." : "📤 Subir"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}