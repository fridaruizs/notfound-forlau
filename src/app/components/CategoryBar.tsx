"use client";
import { useState } from "react";

const DEFAULT_CATEGORIES = [
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

interface CategoryBarProps {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");

  function handleAdd() {
    const trimmed = newCat.trim().toLowerCase();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
      onChange(trimmed);
    }
    setNewCat("");
    setAdding(false);
    setOpen(false);
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
          min-width: 220px;
          max-width: calc(100vw - 20px);
          box-shadow: 2px 2px 6px var(--xp-shadow);
        }
        .category-option {
          padding: 5px 10px;
          cursor: default;
          font-size: 12px;
          border-bottom: 1px solid var(--xp-bg);
          color: var(--xp-text);
          white-space: nowrap;
        }
        .category-option:last-child { border-bottom: none; }
        .category-option:hover,
        .category-option.active {
          background: var(--xp-highlight);
          color: var(--xp-highlight-text);
        }
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
      `}</style>

      <div className="category-bar">
        <button
          className="category-toggle"
          onClick={() => setOpen(o => !o)}
        >
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

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
            onClick={() => { setOpen(false); setAdding(false); setNewCat(""); }}
          />
          <div
            className="category-dropdown"
            style={{ top: "90px", left: "10px" }}
          >
            {categories.map(cat => (
              <div
                key={cat}
                className={`category-option${active === cat ? " active" : ""}`}
                onClick={() => { onChange(cat); setOpen(false); }}
              >
                {cat}
              </div>
            ))}

            {adding && (
              <div className="category-new-row">
                <input
                  className="category-new-input"
                  placeholder="nueva categoría..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewCat(""); } }}
                  autoFocus
                />
                <button className="xp-btn" onClick={handleAdd}>OK</button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}