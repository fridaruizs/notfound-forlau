export default function EmptyState({ category }: { category: string }) {
  return (
    <>
      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 12px;
          text-align: center;
          min-height: calc(100vh - 120px);
        }
        .empty-folder-img { font-size: 56px; }
        .empty-label { font-size: 13px; color: #111; font-weight: bold; }
        .empty-sub { font-size: 12px; color: var(--xp-text-muted); line-height: 1.8; }
      `}</style>
      <div className="empty-state">
        <div className="empty-folder-img">📁</div>
        <div className="empty-label">Esta carpeta está vacía.</div>
        <div className="empty-sub">
          {category === "ver todas"
            ? "No hay imágenes todavía."
            : `No hay imágenes en "${category}" todavía.`}
          <br />
          Volvé pronto.
        </div>
      </div>
    </>
  );
}