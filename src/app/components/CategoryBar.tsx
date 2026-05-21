"use client";
import { useState, useEffect, useCallback } from "react";

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
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Category | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json() as { categories?: Category[] };
if (data.categories) setCategories(data.categories);
} catch {
      setError("No se pudieron cargar las categorías.");
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
      if (res.status === 409) { setError("Esa categoría ya existe."); return; }
      if (!res.ok) throw new Error();
      const data = await res.json() as { category: Category };
setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCat("");
    } catch {
      setError("No se pudo crear la categoría.");
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
      if (res.status === 409) { setError("Esa categoría ya existe."); return; }
      if (!res.ok) throw new Error();
      setCategories(prev =>
        prev.map(c => c.id === cat.id ? { ...c, name: trimmed } : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      if (active === cat.name) onChange(trimmed);
      setRenaming(null);
      setRenameVal("");
    } catch {
      setError("No se pudo renombrar.");
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
      setError("No se pudo eliminar.");
    }
  }

  function handleClose() {
    setOpen(false);
    setRenaming(null);
    setRenameVal("");
    setError(null);
  }

  return (
    <>
      <style>{`
        .category-bar {
          position: relative;
          padding: 5px 10px;
          background: var(--xp-bg);
          border-bottom: 1px solid var(--xp-border-mid);
          display: flex;
          align-items: center;
          gap: 6px;
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

        .category-dropdown {
          position: fixed;
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          z-index: 200;
          min-width: 260px;
          max-width: calc(100vw - 20px);
          box-shadow: 2px 2px 6px var(--xp-shadow);
          max-height: 70vh;
          overflow-y: auto;
        }

        .category-option {
          padding: 4px 8px;
          cursor: default;
          font-size: 12px;
          border-bottom: 1px solid var(--xp-bg);
          color: var(--xp-text);
          display: flex;
          align-items: center;
          gap: 4px;
          user-select: none;
        }
        .category-option:hover { background: #e8e8e8; }
        .category-option.active {
          background: var(--xp-highlight);
          color: var(--xp-highlight-text);
        }
        .category-option.active .cat-action-btn { color: var(--xp-highlight-text); }

        .cat-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cat-count {
          font-size: 10px;
          opacity: 0.55;
          flex-shrink: 0;
          min-width: 20px;
          text-align: right;
        }
        .cat-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          padding: 1px 3px;
          line-height: 1;
          color: var(--xp-text-muted);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.1s;
        }
        .category-option:hover .cat-action-btn { opacity: 1; }
        .cat-action-btn:hover { opacity: 1 !important; color: #000; }
        .cat-action-btn.delete:hover { color: #cc0000; }

        .category-rename-row {
          padding: 3px 8px;
          display: flex;
          gap: 4px;
          background: #fffde0;
          border-bottom: 1px solid var(--xp-border-mid);
        }

        .category-new-row {
          padding: 5px 8px;
          display: flex;
          gap: 4px;
          border-top: 2px solid var(--xp-border-mid);
          background: var(--xp-btn);
        }
        .category-input {
          flex: 1;
          padding: 2px 4px;
          border: 2px inset var(--xp-border-mid);
          background: var(--xp-input-bg);
          font-family: inherit;
          font-size: 12px;
          outline: none;
          min-width: 0;
        }
        .category-error {
          padding: 4px 8px;
          font-size: 11px;
          color: #cc0000;
          border-top: 1px solid var(--xp-border-mid);
          background: #fff0f0;
        }
        .category-loading {
          padding: 8px 10px;
          font-size: 12px;
          color: var(--xp-text-muted);
          font-style: italic;
        }
        .cat-protected-icon {
          font-size: 10px;
          opacity: 0.4;
          flex-shrink: 0;
        }
      `}</style>

      <div className="category-bar">
        <button className="category-toggle" onClick={() => setOpen(o => !o)}>
          <span>{active}</span>
          <span>▾</span>
        </button>
      </div>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
            onClick={handleClose}
          />
          <div className="category-dropdown" style={{ top: "90px", left: "10px" }}>

            {/* ver todas */}
            <div
              className={`category-option${active === "ver todas" ? " active" : ""}`}
              onClick={() => { onChange("ver todas"); handleClose(); }}
            >
              <span className="cat-name">ver todas</span>
            </div>

            {loading && <div className="category-loading">Cargando...</div>}

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
                    <button className="xp-btn" style={{padding:"2px 6px"}} onClick={() => handleRename(cat)}>✓</button>
                    <button className="xp-btn" style={{padding:"2px 6px"}} onClick={() => { setRenaming(null); setRenameVal(""); }}>✕</button>
                  </div>
                ) : (
                  <div
                    className={`category-option${active === cat.name ? " active" : ""}`}
                    onClick={() => { onChange(cat.name); handleClose(); }}
                  >
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">
                      {cat.protected
                        ? <span className="cat-protected-icon">🔒</span>
                        : `(${cat.image_count})`
                      }
                    </span>
                    {!cat.protected && (
                      <>
                        <button
                          className="cat-action-btn"
                          title="Renombrar"
                          onClick={e => {
                            e.stopPropagation();
                            setRenaming(cat);
                            setRenameVal(cat.name);
                          }}
                        >✏️</button>
                        <button
                          className="cat-action-btn delete"
                          title={`Eliminar${cat.image_count > 0 ? ` (${cat.image_count} imgs → sin categoría)` : ""}`}
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(cat);
                          }}
                        >🗑️</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {error && <div className="category-error">{error}</div>}

            {/* Add new at bottom */}
            <div className="category-new-row">
              <input
                className="category-input"
                placeholder="nueva categoría..."
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") handleClose();
                }}
                onClick={e => e.stopPropagation()}
              />
              <button
                className="xp-btn"
                style={{ padding: "2px 8px" }}
                onClick={e => { e.stopPropagation(); handleAdd(); }}
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}