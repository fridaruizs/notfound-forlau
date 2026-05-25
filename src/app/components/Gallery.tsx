"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import EmptyState from "./EmptyState";
import EditImageModal from "./modals/EditImageModal";

const PAGE_SIZE = 20;

interface ImageItem {
  id: string;
  r2_key: string;
  title: string | null;
  description: string | null;
  source_url: string | null;
  visibility: string;
  uploaded_at: number;
  categories: string[];
}

interface GalleryProps {
  activeCategory: string;
  refreshKey: number;
  shuffleKey: number;
  onRefresh: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchPage(catId: string | null, offset: number) {
  let url = `/api/images?limit=${PAGE_SIZE}&offset=${offset}`;
  if (catId) url += `&category_id=${catId}`;
  const res = await fetch(url);
  return res.json() as Promise<{
    images?: ImageItem[];
    pagination?: { hasMore: boolean; total: number };
    error?: string;
  }>;
}

export default function Gallery({ activeCategory, refreshKey, shuffleKey, onRefresh }: GalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<ImageItem | null>(null);
  const [editImage, setEditImage] = useState<ImageItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [categoryId, setCategoryId] = useState<string | null | undefined>(
    activeCategory === "ver todas" ? null : undefined
  );

  useEffect(() => {
    if (activeCategory === "ver todas") { setCategoryId(null); return; }
    setCategoryId(undefined);
    fetch("/api/categories")
      .then(r => r.json() as Promise<{ categories?: { id: string; name: string }[] }>)
      .then(d => {
        const cat = d.categories?.find(c => c.name === activeCategory);
        setCategoryId(cat?.id ?? null);
      })
      .catch(() => setCategoryId(null));
  }, [activeCategory]);

  const fetchFirst = useCallback(async (catId: string | null) => {
    setLoading(true);
    setError(null);
    setImages([]);
    setOffset(0);
    setHasMore(true);
    try {
      const data = await fetchPage(catId, 0);
      if (data.error) throw new Error(data.error);
      setImages(data.images ?? []);
      setHasMore(data.pagination?.hasMore ?? false);
      setOffset(PAGE_SIZE);
    } catch (err) {
      setError("No se pudieron cargar las imágenes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryId === undefined) return;
    fetchFirst(categoryId);
  }, [categoryId, refreshKey, fetchFirst]);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore || shuffling) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(categoryId ?? null, offset);
      if (data.error) throw new Error(data.error);
      setImages(prev => [...prev, ...(data.images ?? [])]);
      setHasMore(data.pagination?.hasMore ?? false);
      setOffset(prev => prev + PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, categoryId, shuffling]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) fetchMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore]);

  useEffect(() => {
    if (shuffleKey === 0) return;
    async function loadAllAndShuffle() {
      setShuffling(true);
      setHasMore(false);
      try {
        let currentOffset = offset;
        let moreAvailable = hasMore;
        let allImages = [...images];
        while (moreAvailable) {
          const data = await fetchPage(categoryId ?? null, currentOffset);
          if (data.error) break;
          allImages = [...allImages, ...(data.images ?? [])];
          moreAvailable = data.pagination?.hasMore ?? false;
          currentOffset += PAGE_SIZE;
        }
        setImages(shuffleArray(allImages));
        setOffset(currentOffset);
      } catch (err) {
        console.error("Shuffle error:", err);
        setImages(prev => shuffleArray(prev));
      } finally {
        setShuffling(false);
      }
    }
    loadAllAndShuffle();
  }, [shuffleKey]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px", fontSize: "12px", color: "#666" }}>
      Cargando...
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px", fontSize: "12px", color: "#cc0000" }}>
      {error}
    </div>
  );

  if (images.length === 0) return <EmptyState category={activeCategory} />;

  return (
    <>
      <style>{`
        .gallery-grid {
          column-count: 3;
          column-gap: 8px;
          padding: 10px;
        }
        @media (max-width: 900px) { .gallery-grid { column-count: 2; } }
        @media (max-width: 540px) { .gallery-grid { column-count: 1; } }

        .gallery-item {
          break-inside: avoid;
          margin-bottom: 8px;
          position: relative;
          cursor: pointer;
          border: 2px solid var(--xp-border-mid);
          border-right-color: var(--xp-border-light);
          border-bottom-color: var(--xp-border-light);
          background: var(--xp-btn);
          overflow: hidden;
        }
        .gallery-item:hover { border-color: var(--xp-highlight); }
        .gallery-img { display: block; width: 100%; height: auto; object-fit: cover; }
        .gallery-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          padding: 20px 8px 6px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .gallery-item:hover .gallery-overlay { opacity: 1; }
        .gallery-title {
          color: white; font-size: 11px; font-weight: bold;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
        }
        .gallery-cats { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px; }
        .gallery-cat {
          background: rgba(255,255,255,0.2); color: white;
          font-size: 9px; padding: 1px 4px;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .gallery-sentinel {
          height: 40px; display: flex; align-items: center;
          justify-content: center; font-size: 11px; color: #888; padding: 10px;
        }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 600;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .lightbox-window {
          background: var(--xp-bg);
          border: 2px outset var(--xp-border-light);
          max-width: 90vw; max-height: 90vh;
          display: flex; flex-direction: column;
          box-shadow: 4px 4px 20px rgba(0,0,0,0.6);
        }
        .lightbox-body { display: flex; overflow: hidden; min-height: 0; }
        .lightbox-img-wrap {
          flex: 1; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: #000; min-height: 200px;
        }
        .lightbox-img { max-width: 100%; max-height: 75vh; object-fit: contain; display: block; }
        .lightbox-info {
          width: 200px; flex-shrink: 0;
          padding: 10px; font-size: 11px;
          overflow-y: auto;
          border-left: 2px inset var(--xp-border-mid);
          display: flex; flex-direction: column; gap: 8px;
        }
        .lightbox-info-label {
          font-weight: bold; font-size: 10px;
          color: var(--xp-text-muted);
          text-transform: uppercase; margin-bottom: 2px;
        }
        .lightbox-info a {
          color: var(--xp-highlight); text-decoration: underline;
          word-break: break-all; font-size: 11px;
        }
        .lightbox-actions {
          padding: 6px 10px;
          border-top: 1px solid var(--xp-border-mid);
          display: flex; gap: 4px; justify-content: flex-end;
        }
        @media (max-width: 600px) {
          .lightbox-body { flex-direction: column; }
          .lightbox-info { width: 100%; border-left: none; border-top: 2px inset var(--xp-border-mid); }
        }
      `}</style>

      {shuffling && (
        <div style={{ textAlign: "center", padding: "8px", fontSize: "11px", color: "#666" }}>
          Mezclando...
        </div>
      )}

      <div className="gallery-grid">
        {images.map(img => (
          <div key={img.id} className="gallery-item" onClick={() => setLightbox(img)}>
            <img
              src={`/api/images/${img.id}`}
              alt={img.title ?? "imagen"}
              className="gallery-img"
              loading="lazy"
            />
            <div className="gallery-overlay">
              {img.title && <div className="gallery-title">{img.title}</div>}
              {img.categories.length > 0 && (
                <div className="gallery-cats">
                  {img.categories.map(cat => (
                    <span key={cat} className="gallery-cat">{cat}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="gallery-sentinel">
        {loadingMore && "Cargando más..."}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-window" onClick={e => e.stopPropagation()}>
            <div className="xp-title-bar">
              <span>🖼️ {lightbox.title ?? "imagen"}</span>
              <div className="xp-close" onClick={() => setLightbox(null)}>✕</div>
            </div>
            <div className="lightbox-body">
              <div className="lightbox-img-wrap">
                <img
                  src={`/api/images/${lightbox.id}`}
                  alt={lightbox.title ?? "imagen"}
                  className="lightbox-img"
                />
              </div>
              <div className="lightbox-info">
                {lightbox.title && (
                  <div>
                    <div className="lightbox-info-label">Título</div>
                    <div>{lightbox.title}</div>
                  </div>
                )}
                {lightbox.description && (
                  <div>
                    <div className="lightbox-info-label">Descripción</div>
                    <div>{lightbox.description}</div>
                  </div>
                )}
                {lightbox.categories.length > 0 && (
                  <div>
                    <div className="lightbox-info-label">Categorías</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                      {lightbox.categories.map(cat => (
                        <span key={cat} style={{
                          background: "var(--xp-highlight)", color: "white",
                          fontSize: "10px", padding: "1px 5px",
                        }}>{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
                {lightbox.source_url && (
                  <div>
                    <div className="lightbox-info-label">Fuente</div>
                    <a href={lightbox.source_url} target="_blank" rel="noopener noreferrer">
                      {lightbox.source_url}
                    </a>
                  </div>
                )}
                <div>
                  <div className="lightbox-info-label">Subido</div>
                  <div>{new Date(lightbox.uploaded_at * 1000).toLocaleDateString("es-AR")}</div>
                </div>
              </div>
            </div>
            <div className="lightbox-actions">
              <button
                className="xp-btn"
                onClick={() => { setEditImage(lightbox); setLightbox(null); }}
              >
                ✏️ Editar
              </button>
              {lightbox.source_url && (
                <a href={lightbox.source_url} target="_blank" rel="noopener noreferrer">
                  <button className="xp-btn">🔗 Fuente</button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editImage && (
        <EditImageModal
          image={editImage}
          onClose={() => setEditImage(null)}
          onSuccess={() => {
            setEditImage(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}