"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../lib/LangContext";

interface NotifNote {
  id: string;
  content: string;
  color: string;
  created_at: number;
  author: string | null;
}

const POLL_MS = 60_000;

const NOTE_BG: Record<string, string> = {
  yellow: "#fff68f",
  pink: "#ffb3d9",
  blue: "#a8d4ff",
  green: "#b8f2b8",
  orange: "#ffcc99",
};

export default function NotificationBell() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [notes, setNotes] = useState<NotifNote[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json() as { notes?: NotifNote[] };
      setNotes(data.notes ?? []);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  // Initial load + polling (paused while the tab is hidden)
  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    const onVis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markRead() {
    setNotes([]);
    try { await fetch("/api/notifications", { method: "POST" }); } catch { /* ignore */ }
  }

  async function goToBoard() {
    setOpen(false);
    await markRead();
    router.push("/notes");
  }

  const count = notes.length;
  const badge = count > 9 ? "9+" : String(count);
  const locale = lang === "ca" ? "ca-ES" : "es-AR";

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <style>{`
        .notif-wrap { position: relative; flex-shrink: 0; }
        .notif-btn { position: relative; }
        .notif-btn.has-new { animation: notif-shake 2.5s ease-in-out infinite; }
        @keyframes notif-shake {
          0%, 88%, 100% { transform: rotate(0); }
          91% { transform: rotate(-12deg); }
          94% { transform: rotate(10deg); }
          97% { transform: rotate(-6deg); }
        }
        .notif-badge {
          position: absolute; top: -5px; right: -6px;
          min-width: 15px; height: 15px; padding: 0 3px;
          background: #ff0000; color: #fff;
          border: 1px solid #800000;
          font-size: 9px; font-weight: bold; line-height: 13px;
          text-align: center; font-family: Tahoma, "MS Sans Serif", sans-serif;
          pointer-events: none;
        }
        .notif-panel {
          position: absolute; top: calc(100% + 6px); right: 0;
          width: 290px; max-width: calc(100vw - 16px);
          background: #D4D0C8;
          border: 2px outset #ffffff;
          box-shadow: 2px 2px 0 #000;
          z-index: 1000;
          font-family: Tahoma, "MS Sans Serif", sans-serif;
          font-size: 11px; color: #000;
        }
        .notif-titlebar {
          background: linear-gradient(to right, #000080, #1084d0);
          color: #fff; font-weight: bold;
          padding: 3px 4px 3px 6px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .notif-close {
          width: 16px; height: 14px; padding: 0;
          background: #D4D0C8; border: 2px outset #fff;
          font-size: 9px; font-weight: bold; line-height: 8px;
          cursor: pointer; color: #000; font-family: inherit;
        }
        .notif-close:active { border-style: inset; }
        .notif-list {
          margin: 6px; max-height: 260px; overflow-y: auto;
          background: #fff; border: 2px inset #fff;
        }
        .notif-item {
          display: flex; gap: 6px; align-items: flex-start;
          padding: 5px 6px; border-bottom: 1px dotted #808080;
          cursor: pointer; text-align: left; width: 100%;
          background: none; border-left: none; border-right: none; border-top: none;
          font-family: inherit; font-size: 11px; color: #000;
        }
        .notif-item:hover { background: #316ac5; color: #fff; }
        .notif-swatch {
          width: 12px; height: 12px; flex-shrink: 0; margin-top: 1px;
          border: 1px solid #808080;
        }
        .notif-text { flex: 1; min-width: 0; }
        .notif-line { display: block; }
        .notif-snippet {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          opacity: 0.85;
        }
        .notif-date { font-size: 10px; opacity: 0.7; }
        .notif-empty { padding: 14px 8px; text-align: center; color: #404040; }
        .notif-actions {
          display: flex; justify-content: flex-end; gap: 4px;
          padding: 0 6px 6px;
        }
        .notif-actions .xp-btn { font-size: 11px; padding: 2px 8px; }
      `}</style>

      <button
        className={`icon-btn notif-btn${count > 0 ? " has-new" : ""}`}
        title={t("notifTitle")}
        aria-label={`${t("notifTitle")}${count > 0 ? ` (${count})` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        🔔
        {count > 0 && <span className="notif-badge">{badge}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label={t("notifTitle")}>
          <div className="notif-titlebar">
            <span>🔔 {t("notifTitle")}</span>
            <button className="notif-close" onClick={() => setOpen(false)} aria-label="close">✕</button>
          </div>

          <div className="notif-list">
            {error && count === 0 ? (
              <div className="notif-empty">{t("notifError")}</div>
            ) : count === 0 ? (
              <div className="notif-empty">{t("notifEmpty")}</div>
            ) : (
              notes.map(n => (
                <button key={n.id} className="notif-item" onClick={goToBoard}>
                  <span className="notif-swatch" style={{ background: NOTE_BG[n.color] ?? NOTE_BG.yellow }} />
                  <span className="notif-text">
                    <span className="notif-line"><b>{n.author ?? t("notifSomeone")}</b> {t("notifNewNote")}</span>
                    <span className="notif-line notif-snippet">“{n.content}”</span>
                    <span className="notif-line notif-date">{new Date(n.created_at * 1000).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="notif-actions">
            {count > 0 && (
              <button className="xp-btn" onClick={markRead}>{t("notifMarkRead")}</button>
            )}
            <button className="xp-btn" onClick={goToBoard}>{t("notifGoToBoard")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
