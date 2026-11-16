"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../lib/LangContext";

interface User {
  id: string;
  username: string;
  role: string;
}

interface Note {
  id: string;
  content: string;
  color: string;
  created_at: number;
  author: string | null;
}

const COLORS = [
  { key: "yellow", bg: "#fff68f", rot: "-1.5deg" },
  { key: "pink", bg: "#ffb3d9", rot: "1deg" },
  { key: "blue", bg: "#a8d4ff", rot: "-1deg" },
  { key: "green", bg: "#b8f2b8", rot: "1.5deg" },
  { key: "orange", bg: "#ffcc99", rot: "-0.8deg" },
];

function colorInfo(key: string) {
  return COLORS.find(c => c.key === key) ?? COLORS[0];
}

export default function NotesPage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState("yellow");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json() as Promise<{ user: User | null }>)
      .then(d => {
        if (!d.user || d.user.role !== "admin") { router.push("/"); return; }
        setUser(d.user);
      })
      .catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchNotes();
    // Opening the board clears the admin notification bell
    fetch("/api/notifications", { method: "POST" }).catch(() => {});
  }, [user]);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json() as { notes?: Note[]; error?: string };
      if (data.notes) setNotes(data.notes);
    } catch {
      setError(t("notesErrorLoad"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!newContent.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), color: newColor }),
      });
      if (!res.ok) throw new Error();
      setNewContent("");
      await fetchNotes();
    } catch {
      setError(t("notesErrorPost"));
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch {
      setError(t("notesErrorDelete"));
    }
  }

  if (user === undefined) {
    return (
      <div style={{ background: "#C0C0C0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Tahoma, sans-serif", fontSize: "12px" }}>
        Cargando...
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'MS Sans Serif', Tahoma, Geneva, sans-serif;
          font-size: 12px;
          background: #C0C0C0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.03) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.03) 40px);
          min-height: 100vh;
        }

        .notes-header {
          background: #808080;
          border-bottom: 2px solid #fff;
          border-top: 2px solid #404040;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 46px;
        }
        .notes-header-title {
          font-weight: bold;
          font-size: 15px;
          color: white;
          text-shadow: 1px 1px 0 #000;
        }
        .back-link {
          display: inline-flex; align-items: center; gap: 4px;
          color: white; text-shadow: 1px 1px 0 #000; font-size: 12px;
          cursor: pointer; background: none; border: none; font-family: inherit;
        }
        .back-link:hover { text-decoration: underline; }

        .xp-btn {
          background: #D4D0C8; border: 2px outset #fff;
          padding: 3px 12px; font-family: inherit; font-size: 12px;
          cursor: pointer; color: #000;
        }
        .xp-btn:active { border-style: inset; }
        .xp-btn:hover { background: #E0DDD4; }

        .compose-bar {
          background: #D4D0C8;
          border-bottom: 2px solid #808080;
          padding: 10px 16px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .compose-textarea {
          flex: 1;
          min-width: 200px;
          padding: 5px 7px;
          border: 2px inset #808080;
          background: white;
          font-family: inherit;
          font-size: 12px;
          outline: none;
          resize: vertical;
          min-height: 44px;
        }
        .color-picker {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .color-swatch {
          width: 20px;
          height: 20px;
          border: 2px outset #fff;
          cursor: pointer;
        }
        .color-swatch.active {
          border-style: inset;
          box-shadow: 0 0 0 1px #000080;
        }

        .notes-board {
          padding: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-content: flex-start;
          justify-content: center;
        }

        .sticky-note {
          width: 200px;
          min-height: 180px;
          padding: 10px;
          background: #D4D0C8;
          border: 2px outset #fff;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
          font-family: 'MS Sans Serif', Tahoma, Geneva, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          display: flex;
          flex-direction: column;
        }
        .sticky-titlebar {
          background: linear-gradient(to right, #000080, #1084d0);
          color: white;
          font-weight: bold;
          font-size: 11px;
          padding: 2px 5px;
          margin: -10px -10px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sticky-titlebar-label {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sticky-close {
          background: #D4D0C8;
          border: 1px outset #fff;
          width: 14px;
          height: 12px;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
          cursor: pointer;
          flex-shrink: 0;
        }
        .sticky-close:active { border-style: inset; }
        .sticky-body {
          background: var(--note-color, #fff68f);
          border: 2px inset #808080;
          padding: 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sticky-content {
          white-space: pre-wrap;
          word-break: break-word;
          flex: 1;
        }
        .sticky-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 10px;
          color: #444;
          border-top: 1px solid rgba(0,0,0,0.15);
          padding-top: 6px;
        }

        .empty-board {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 60px 20px;
          width: 100%;
        }

        .error-msg { color: #cc0000; font-size: 11px; padding: 4px 16px; }
      `}</style>

      <div className="notes-header">
        <button className="back-link" onClick={() => router.push("/profile")}>
          {t("notesBack")}
        </button>
        <span className="notes-header-title">📌 {t("notesTitle")}</span>
        <div style={{ width: "100px" }} />
      </div>

      <div className="compose-bar">
        <textarea
          className="compose-textarea"
          placeholder={t("notesPlaceholder")}
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          maxLength={200}
        />
        <div className="color-picker">
          {COLORS.map(c => (
            <div
              key={c.key}
              className={`color-swatch${newColor === c.key ? " active" : ""}`}
              style={{ background: c.bg }}
              onClick={() => setNewColor(c.key)}
              title={c.key}
            />
          ))}
        </div>
        <button className="xp-btn" onClick={handlePost} disabled={posting || !newContent.trim()} style={{ fontWeight: "bold" }}>
          {posting ? "..." : t("notesPublish")}
        </button>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="notes-board">
        {loading ? (
          <div className="empty-board">{t("notesLoading")}</div>
        ) : notes.length === 0 ? (
          <div className="empty-board">{t("notesEmpty")}</div>
        ) : (
          notes.map((note) => {
            const c = colorInfo(note.color);
            return (
              <div
                key={note.id}
                className="sticky-note"
              >
                <div className="sticky-titlebar">
                  <span className="sticky-titlebar-label">{t("notesFileLabel")}</span>
                  <div className="sticky-close" onClick={() => handleDelete(note.id)} title="Eliminar">✕</div>
                </div>
                <div className="sticky-body" style={{ "--note-color": c.bg } as React.CSSProperties}>
                  <div className="sticky-content">{note.content}</div>
                  <div className="sticky-footer">
                    <div>{note.author ?? "?"}</div>
                    <div>{new Date(note.created_at * 1000).toLocaleDateString("es-AR")}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}