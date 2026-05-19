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
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState<string | null>(null);

  // context menu state
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; cat: Category } | null>(null);
  const [renaming, setRenaming] = useState<Category | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json() as { categories?: Category[] };
      if (data.categories) setCategories(data.categories);
    } catch (err) {
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
      onChange(data.category.name);
      setNewCat("");
      setAdding(false);
      setOpen(false);
    } catch {
      setError("No se pudo crear la categoría.");
    }
  }

  async function handleRename() {
    if (!renaming) return;
    const trimmed = renameVal.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);

    try {
      const res = await fetch(`/api/categories/${renaming.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.status === 409) { setError("Esa categoría ya existe."); return; }
      if (!res.ok) throw new Error();

      setCategories(prev =>
        prev.map(c => c.id === renaming.id ? { ...c, name: trimmed } : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      if (active === renaming.name) onChange(trimmed);
      setRenaming(null);
      setRenameVal("");
    } catch {
      setError("No se pudo renombrar.");
    }
  }

  async function handleDelete(cat: Category) {
    setCtxMenu(null);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setCategories(prev => prev.filter(c => c.id !== cat.id));
      if (active === cat.name) onChange("ver todas");
    } catch {
      setError("No se pudo eliminar la categoría.");
    }
  }

  function handleClose() {
    setOpen(false);
    setAdding(false);
    setNewCat("");
    setCtxMenu(null);
    setRenaming(null);
    setError(null);
  }

  function onRightClick(e: React.MouseEvent, cat: Category) {
    if (cat.protected) return;
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, cat });
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
        .category-add-btn {
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          width: 26px;
          height: 26px;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--xp-text);
          flex-shrink: 0;
          font-weight: bold;
        }
        .category-add-btn:active { border-style: inset; }
        .category-add-btn:hover { background: var(--xp-btn-hover); }

        .category-dropdown {
          position: fixed;
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          z-index: 200;
          min-width: 240px;
          max-width: calc(100vw - 20px);
          box-shadow: 2px 2px 6px var(--xp-shadow);
          max-height: 60vh;
          overflow-y: auto;
        }
        .category-option {
          padding: 5px 10px;
          cursor: default;
          font-size: 12px;
          border-bottom: 1px solid var(--xp-bg);
          color: var(--xp-text);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          user-select: none;
        }
        .category-option:hover,
        .category-option.active {
          background: var(--xp-highlight);
          color: var(--xp-highlight-text);
        }
        .category-count {
          font-size: 10px;
          opacity: 0.6;
          flex-shrink: 0;
        }
        .category-protected-icon {
          font-size: 10px;
          opacity: 0.5;
          flex-shrink: 0;
        }

        .category-loading, .category-error {
          padding: 8px 10px;
          font-size: 12px;
        }
        .category-loading { color: var(--xp-text-muted); font-style: italic; }
        .category-error { color: #cc0000; border-top: 1px solid var(--xp-border-mid); }

        .category-new-row {
          padding: 5px 8px;
          display: flex;
          gap: 4px;
          border-top: 1px solid var(--xp-border-mid);
        }
        .category-new-input {
          flex: 1;
          padding: 2px 4px;
          border: 2px inset var(--xp-border-mid);
          background: var(--xp-input-bg);
          font-family: inherit;
          font-size: 12px;
          outline: none;
          min-width: 0;
        }

        /* Context menu */
        .ctx-menu {
          position: fixed;
          background: var(--xp-btn);
          border: 2px outset var(--xp-border-light);
          z-index: 300;
          min-width: 160px;
          box-shadow: 2px 2px 6px var(--xp-shadow);
        }
        .ctx-menu-item {
          padding: 5px 12px;
          font-size: 12px;
          cursor: default;
          color: var(--xp-text);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ctx-menu-item:hover {
          background: var(--xp-highlight);
          color: var(--xp-highlight-text);
        }
        .ctx-menu-item.danger:hover {
          background: #cc0000;
          color: white;
        }
        .ctx-menu-divider {
          height: 1px;
          background: var(--xp-border-mid);
          margin: 2px 0;
        }

        /* Rename inline */
        .rename-row {
          padding: 4px 8px;
          display: flex;
          gap: 4px;
          background: #fffde0;
          border-bottom: 1px solid var(--xp-border-mid);
        }
      `}</style>

      <div className="category-bar">
        <button className="category-toggle" onClick={() => setOpen(o => !o)}>
          <span>{active}</span>
          <span>▾</span>
        </button>
        <button
          className="category-add-btn"
          title="Nueva categoría"
          onClick={() => { setAdding(true); setOpen(true); }}
        >
          +
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={handleClose} />
          <div className="category-dropdown" style={{ top: "90px", left: "10px" }}>

            {/* ver todas — always first, never in DB */}
            <div
              className={`category-option${active === "ver todas" ? " active" : ""}`}
              onClick={() => { onChange("ver todas"); handleClose(); }}
            >
              <span>ver todas</span>
            </div>

            {loading && <div className="category-loading">Cargando...</div>}

            {!loading && categories.map(cat => (
              <div key={cat.id}>
                {renaming?.id === cat.id ? (
                  <div className="rename-row">
                    <input
                      className="category-new-input"
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") { setRenaming(null); setRenameVal(""); }
                      }}
                      autoFocus
                    />
                    <button className="xp-btn" onClick={handleRename}>OK</button>
                  </div>
                ) : (
                  <div
                    className={`category-option${active === cat.name ? " active" : ""}`}
                    onClick={() => { onChange(cat.name); handleClose(); }}
                    onContextMenu={e => onRightClick(e, cat)}
                  >
                    <span>{cat.name}</span>
                    <span className="category-count">
                      {cat.protected ? <span className="category-protected-icon">🔒</span> : `(${cat.image_count})`}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {error && <div className="category-error">{error}</div>}

            {adding && (
              <div className="category-new-row">
                <input
                  className="category-new-input"
                  placeholder="nueva categoría..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") handleClose();
                  }}
                  autoFocus
                />
                <button className="xp-btn" onClick={handleAdd}>OK</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 299 }}
            onClick={() => setCtxMenu(null)}
            onContextMenu={e => { e.preventDefault(); setCtxMenu(null); }}
          />
          <div className="ctx-menu" style={{ top: ctxMenu.y, left: ctxMenu.x }}>
            <div
              className="ctx-menu-item"
              onClick={() => {
                setRenaming(ctxMenu.cat);
                setRenameVal(ctxMenu.cat.name);
                setCtxMenu(null);
                setOpen(true);
              }}
            >
              ✏️ Renombrar
            </div>
            <div className="ctx-menu-divider" />
            <div
              className="ctx-menu-item danger"
              onClick={() => handleDelete(ctxMenu.cat)}
            >
              🗑️ Eliminar
              {ctxMenu.cat.image_count > 0 && (
                <span style={{ fontSize: "10px", opacity: 0.7 }}>
                  &nbsp;({ctxMenu.cat.image_count} imgs → sin categoría)
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}