"use client";
import { useState, useEffect, useCallback } from "react";
import { useLang } from "../lib/LangContext";
import { translateCategory } from "../lib/translations";

interface Category {
  id: string;
  name: string;
  protected: number;
  image_count: number;
}

interface CategoryBarProps {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Category | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const verTodas = t("verTodas");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json() as { categories?: Category[] };
      if (data.categories) setCategories(data.categories);
    } catch {
      setError(t("catErrorLoad"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd() {
    const trimmed = newCat.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.status === 409) { setError(t("catErrorExists")); return; }
      if (!res.ok) throw new Error();
      const data = await res.json() as { category: Category };
      setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(data.category.name);
      setNewCat("");
      setOpen(false);
    } catch {
      setError(t("catErrorCreate"));
    }
  }

  async function handleRename(cat: Category) {
    const trimmed = renameVal.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.status === 409) { setError(t("catErrorExists")); return; }
      if (!res.ok) throw new Error();
      setCategories(prev =>
        prev.map(c => c.id === cat.id ? { ...c, name: trimmed } : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      if (active === cat.name) onChange(trimmed);
      setRenaming(null);
      setRenameVal("");
    } catch {
      setError(t("catErrorRename"));
    }
  }

  async function handleDelete(cat: Category) {
    setError(null);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      if (active === cat.name) onChange("ver todas");
    } catch {
      setError(t("catErrorDelete"));
    }
  }

  function handleClose() {
    setOpen(false);
    setRenaming(null);
    setError(null);
    setNewCat("");
  }

  const displayActive = active === "ver todas" || active === "veure totes"
    ? verTodas
    : translateCategory(active, lang);

  const isCA = lang === "ca";

  return (
    <>
      <style>{`
        .category-bar {
          padding: 5px 10px;
          background: var(--xp-bg);
          border-bottom: 1px solid var(--xp-border-mid);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .category-toggle {
          background: var(--xp-btn);
          border: 2px inset var(--xp-border-mid);
          padding: 3px 8px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          min-width: 180px;
          max-width: 260px;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: var(--xp-text);
        }

        /* XP sliding switch */
        .lang-switch {
          flex-shrink: 0;
          cursor: pointer;
          user-select: none;
          border: 2px solid #404040;
          border-right-color: #fff;
          border-bottom-color: #fff;
          background: #C0C0C0;
          height: 22px;
          width: 84px;
          position: relative;
          overflow: hidden;
        }
        .lang-switch-thumb {
          position: absolute;
          top: 0;
          width: 42px;
          height: 100%;
          background: #000080;
          transition: left 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
          font-family: 'MS Sans Serif', Tahoma, sans-serif;
          z-index: 1;
        }
        .lang-switch-labels {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
        }
        .lang-switch-label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          font-family: 'MS Sans Serif', Tahoma, sans-serif;
          color: #555;
        }

        .category-dropdown {
          position: fixed;
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          z-index: 200;
          min-width: 240px;
          max-width: calc(100vw - 20px);
          box-shadow: 2px 2px 6px var(--xp-shadow);
          max-height: 70vh;
          overflow-y: auto;
        }
        .category-option {
          padding: 4px 8px; cursor: default; font-size: 12px;
          border-bottom: 1px solid var(--xp-bg); color: var(--xp-text);
          display: flex; align-items: center; gap: 4px; user-select: none;
        }
        .category-option:hover { background: #e8e8e8; }
        .category-option.active { background: var(--xp-highlight); color: var(--xp-highlight-text); }
        .category-option.active .cat-action-btn { color: var(--xp-highlight-text); }
        .cat-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cat-count { font-size: 10px; opacity: 0.55; flex-shrink: 0; min-width: 20px; text-align: right; }
        .cat-action-btn {
          background: none; border: none; cursor: pointer; font-size: 12px;
          padding: 1px 3px; line-height: 1; color: var(--xp-text-muted);
          flex-shrink: 0; opacity: 0; transition: opacity 0.1s;
        }
        .category-option:hover .cat-action-btn { opacity: 1; }
        .cat-action-btn:hover { opacity: 1 !important; color: #000; }
        .cat-action-btn.delete:hover { color: #cc0000; }
        .category-rename-row {
          padding: 3px 8px; display: flex; gap: 4px;
          background: #fffde0; border-bottom: 1px solid var(--xp-border-mid);
        }
        .category-new-row {
          padding: 5px 8px; display: flex; gap: 4px;
          border-top: 2px solid var(--xp-border-mid); background: var(--xp-btn);
        }
        .category-input {
          flex: 1; padding: 2px 4px; border: 2px inset var(--xp-border-mid);
          background: var(--xp-input-bg); font-family: inherit; font-size: 12px;
          outline: none; min-width: 0;
        }
        .category-error { padding: 4px 8px; font-size: 11px; color: #cc0000; border-top: 1px solid var(--xp-border-mid); background: #fff0f0; }
        .category-loading { padding: 8px 10px; font-size: 12px; color: var(--xp-text-muted); font-style: italic; }
        .cat-protected-icon { font-size: 10px; opacity: 0.4; flex-shrink: 0; }
      `}</style>

      <div className="category-bar">
        <button className="category-toggle" onClick={() => setOpen(o => !o)}>
          <span>{displayActive}</span>
          <span>▾</span>
        </button>

        {/* Sliding XP toggle */}
        <div
          className="lang-switch"
          onClick={() => setLang(isCA ? "es" : "ca")}
          title={isCA ? "Canviar a Español" : "Canviar a Català"}
        >
          <div className="lang-switch-labels">
            <span className="lang-switch-label">AR</span>
            <span className="lang-switch-label">CA</span>
          </div>
          <div
            className="lang-switch-thumb"
            style={{ left: isCA ? "42px" : "0px" }}
          >
            {isCA ? "CA" : "AR"}
          </div>
        </div>
      </div>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={handleClose} />
          <div className="category-dropdown" style={{ top: "90px", left: "10px" }}>
            <div
              className={`category-option${active === "ver todas" || active === "veure totes" ? " active" : ""}`}
              onClick={() => { onChange("ver todas"); handleClose(); }}
            >
              <span className="cat-name">{verTodas}</span>
            </div>

            {loading && <div className="category-loading">{t("catLoading")}</div>}

            {!loading && categories.map(cat => (
              <div key={cat.id}>
                {renaming?.id === cat.id ? (
                  <div className="category-rename-row">
                    <input
                      className="category-input"
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleRename(cat);
                        if (e.key === "Escape") { setRenaming(null); setRenameVal(""); }
                      }}
                      autoFocus
                    />
                    <button className="xp-btn" style={{ padding: "2px 6px" }} onClick={() => handleRename(cat)}>✓</button>
                    <button className="xp-btn" style={{ padding: "2px 6px" }} onClick={() => { setRenaming(null); setRenameVal(""); }}>✕</button>
                  </div>
                ) : (
                  <div
                    className={`category-option${active === cat.name ? " active" : ""}`}
                    onClick={() => { onChange(cat.name); handleClose(); }}
                  >
                    <span className="cat-name">{translateCategory(cat.name, lang)}</span>
                    <span className="cat-count">
                      {cat.protected
                        ? <span className="cat-protected-icon">🔒</span>
                        : `(${cat.image_count})`}
                    </span>
                    {!cat.protected && (
                      <>
                        <button className="cat-action-btn" title={t("catRename")}
                          onClick={e => { e.stopPropagation(); setRenaming(cat); setRenameVal(cat.name); }}>✏️</button>
                        <button className="cat-action-btn delete" title={t("catDelete")}
                          onClick={e => { e.stopPropagation(); handleDelete(cat); }}>🗑️</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {error && <div className="category-error">{error}</div>}

            <div className="category-new-row">
              <input
                className="category-input"
                placeholder={t("newCategory")}
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") handleClose();
                }}
                onClick={e => e.stopPropagation()}
              />
              <button className="xp-btn" style={{ padding: "2px 8px" }}
                onClick={e => { e.stopPropagation(); handleAdd(); }}>
                {t("catAdd")}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}