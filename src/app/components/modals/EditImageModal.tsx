"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/app/lib/LangContext";
import { translateCategory } from "@/app/lib/translations";

interface Category {
  id: string;
  name: string;
  protected: number;
}

interface ImageItem {
  id: string;
  title: string | null;
  description: string | null;
  source_url: string | null;
  visibility: string;
  categories: string[];
}

interface EditImageModalProps {
  image: ImageItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditImageModal({ image, onClose, onSuccess }: EditImageModalProps) {
  const { lang, t } = useLang();
  const [title, setTitle] = useState(image.title ?? "");
  const [description, setDescription] = useState(image.description ?? "");
  const [sourceUrl, setSourceUrl] = useState(image.source_url ?? "");
  const [visibility, setVisibility] = useState(image.visibility ?? "public");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json() as Promise<{ categories?: Category[] }>)
      .then(d => {
        const cats = d.categories?.filter(c => !c.protected) ?? [];
        setCategories(cats);
        const preSelected = cats.filter(c => image.categories.includes(c.name)).map(c => c.id);
        setSelectedCategories(preSelected);
      })
      .catch(() => {});
  }, [image.categories]);

  function toggleCategory(id: string) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || null, description: description.trim() || null, source_url: sourceUrl.trim() || null, visibility, category_ids: selectedCategories }),
      });
      if (!res.ok) { const data = await res.json() as { error?: string }; throw new Error(data.error); }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/images/${image.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onSuccess();
      onClose();
    } catch {
      setError("Error");
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 16px; }
        .edit-window { background: var(--xp-bg); border: 2px outset var(--xp-border-light); box-shadow: 3px 3px 10px var(--xp-shadow); width: 100%; max-width: 460px; max-height: 90vh; display: flex; flex-direction: column; }
        .edit-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
        .edit-row { display: flex; flex-direction: column; gap: 3px; }
        .edit-row-inline { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .edit-footer { padding: 8px 14px; border-top: 1px solid var(--xp-border-mid); display: flex; justify-content: space-between; align-items: center; gap: 6px; background: var(--xp-bg); }
        .edit-footer-right { display: flex; gap: 6px; }
        .edit-error { color: #cc0000; font-size: 11px; padding: 3px 0; }
        .category-chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px; border: 2px inset var(--xp-border-mid); background: white; min-height: 32px; }
        .chip { background: var(--xp-btn); border: 1px outset var(--xp-border-light); padding: 2px 7px; font-size: 11px; cursor: pointer; font-family: inherit; color: var(--xp-text); white-space: nowrap; }
        .chip:active { border-style: inset; }
        .chip.selected { background: var(--xp-highlight); color: var(--xp-highlight-text); border-color: var(--xp-highlight); }
        .visibility-row { display: flex; gap: 12px; align-items: center; font-size: 12px; }
        .visibility-row label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
        .delete-confirm { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #cc0000; }
        .btn-danger { background: #cc0000; color: white; border: 2px outset #ff4444; padding: 3px 10px; font-family: inherit; font-size: 12px; cursor: pointer; }
        .btn-danger:active { border-style: inset; }
        @media (max-width: 480px) { .edit-row-inline { grid-template-columns: 1fr; } }
      `}</style>

      <div className="edit-overlay" onClick={onClose}>
        <div className="edit-window" onClick={e => e.stopPropagation()}>
          <div className="xp-title-bar">
            <span>✏️ {t("editTitle")}</span>
            <div className="xp-close" onClick={onClose}>✕</div>
          </div>
          <div className="edit-body">
            <img src={`/api/images/${image.id}`} alt={image.title ?? "imagen"}
              style={{ width: "100%", maxHeight: "160px", objectFit: "cover", border: "2px inset var(--xp-border-mid)" }} />
            <div className="edit-row-inline">
              <div className="edit-row">
                <label className="xp-label">{t("title")}</label>
                <input className="xp-input" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
              </div>
              <div className="edit-row">
                <label className="xp-label">{t("uploadVisibility")}</label>
                <div className="visibility-row">
                  <label><input type="radio" name="edit-vis" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} /> {t("uploadPublic")}</label>
                  <label><input type="radio" name="edit-vis" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} /> {t("uploadPrivate")}</label>
                </div>
              </div>
            </div>
            <div className="edit-row">
              <label className="xp-label">{t("description")}</label>
              <textarea className="xp-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="edit-row">
              <label className="xp-label">{t("source")}</label>
              <input className="xp-input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} type="url" />
            </div>
            <div className="edit-row">
              <label className="xp-label">{t("categories")}</label>
              <div className="category-chips">
                {categories.length === 0
                  ? <span style={{ fontSize: "11px", color: "#888", padding: "2px 4px" }}>{t("catLoading")}</span>
                  : categories.map(cat => (
                    <button key={cat.id} className={`chip${selectedCategories.includes(cat.id) ? " selected" : ""}`}
                      onClick={() => toggleCategory(cat.id)} type="button">
                      {selectedCategories.includes(cat.id) ? "✓ " : ""}{translateCategory(cat.name, lang)}
                    </button>
                  ))
                }
              </div>
            </div>
            {error && <div className="edit-error">⚠️ {error}</div>}
          </div>
          <div className="edit-footer">
            <div>
              {confirmDelete ? (
                <div className="delete-confirm">
                  <span>{t("editConfirm")}</span>
                  <button className="btn-danger" onClick={handleDelete} disabled={saving}>{t("editConfirmYes")}</button>
                  <button className="xp-btn" onClick={() => setConfirmDelete(false)}>{t("editConfirmNo")}</button>
                </div>
              ) : (
                <button className="xp-btn" style={{ color: "#cc0000" }} onClick={() => setConfirmDelete(true)} disabled={saving}>
                  🗑️ {t("editDelete")}
                </button>
              )}
            </div>
            <div className="edit-footer-right">
              <button className="xp-btn" onClick={onClose} disabled={saving}>{t("uploadCancel")}</button>
              <button className="xp-btn" onClick={handleSave} disabled={saving} style={{ fontWeight: "bold" }}>
                {saving ? t("editSaving") : t("editSave")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}