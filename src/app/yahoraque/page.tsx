"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../lib/LangContext";

interface User {
  id: string;
  username: string;
  role: string;
}

export default function YAhoraQuePage() {
  const router = useRouter();
  const { lang } = useLang();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json() as Promise<{ user: User | null }>)
      .then(d => {
        if (!d.user) { router.push("/"); return; }
        setUser(d.user);
      })
      .catch(() => router.push("/"));
  }, [router]);

  if (user === undefined) {
    return (
      <div style={{
        background: "#008080", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Tahoma, sans-serif", fontSize: "12px", color: "white"
      }}>
        {lang === "ca" ? "Carregant..." : "Cargando..."}
      </div>
    );
  }

  if (!user) return null;

  const message = lang === "ca"
    ? "Feliç aniversari,"
    : "Feliz cumpleaños,";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          height: 100%;
          font-family: 'MS Sans Serif', Tahoma, Geneva, sans-serif;
          background-color: #008080;
          background-image:
            radial-gradient(ellipse at 20% 30%, rgba(0,110,110,0.4) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, rgba(0,70,90,0.3) 0%, transparent 55%);
          overflow: hidden;
        }

        .yaq-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .yaq-window {
          background: #D4D0C8;
          border: 2px outset #fff;
          box-shadow: 4px 4px 16px rgba(0,0,0,0.5);
          width: 100%;
          max-width: 520px;
        }

        .yaq-title-bar {
          background: linear-gradient(to right, #000080, #1084d0);
          color: white;
          font-weight: bold;
          font-size: 12px;
          padding: 3px 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .yaq-close {
          background: #D4D0C8;
          border: 1px outset #fff;
          width: 16px;
          height: 14px;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #000;
          cursor: pointer;
        }

        .yaq-body {
          padding: 50px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: white;
          margin: 3px;
        }

        .yaq-message {
          font-size: 28px;
          font-weight: bold;
          color: #000080;
          text-align: center;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.15);
          letter-spacing: 0.5px;
          line-height: 1.4;
        }

        .yaq-sparkles {
          font-size: 20px;
          letter-spacing: 8px;
        }

        /* Pixel art cake, drawn with box-shadow pixels on a single div grid */
        .pixel-cake {
          width: 128px;
          height: 112px;
          position: relative;
          image-rendering: pixelated;
          animation: pixelBounce 1.4s ease-in-out infinite;
        }
        @keyframes pixelBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 480px) {
          .yaq-message { font-size: 20px; }
          .yaq-body { padding: 36px 16px; }
          .pixel-cake { width: 96px; height: 84px; }
        }
      `}</style>

      <div className="yaq-container">
        <div className="yaq-window">
          <div className="yaq-title-bar">
            <span>🎉 y_ahora_que.exe</span>
            <div className="yaq-close" onClick={() => router.push("/")}>✕</div>
          </div>
          <div className="yaq-body">
            <div className="yaq-sparkles">✨ ✨ ✨</div>

            <PixelCake />

            <div className="yaq-message">
              {message}<br />Lauti
            </div>
            <div className="yaq-sparkles">✨ ✨ ✨</div>
          </div>
        </div>
      </div>
    </>
  );
}

function PixelCake() {
  // 16x14 pixel grid cake, rendered with SVG for crisp pixel edges
  return (
    <svg
      className="pixel-cake"
      viewBox="0 0 16 14"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* candle flames */}
      <rect x="3" y="0" width="1" height="1" fill="#ff9900" />
      <rect x="7" y="0" width="1" height="1" fill="#ff9900" />
      <rect x="11" y="0" width="1" height="1" fill="#ff9900" />

      {/* candles */}
      <rect x="3" y="1" width="1" height="2" fill="#ff4d4d" />
      <rect x="7" y="1" width="1" height="2" fill="#4d94ff" />
      <rect x="11" y="1" width="1" height="2" fill="#66cc66" />

      {/* top frosting layer */}
      <rect x="1" y="4" width="14" height="2" fill="#ffe0f0" />
      <rect x="1" y="4" width="1" height="1" fill="#fff5fa" />
      <rect x="4" y="4" width="1" height="1" fill="#fff5fa" />
      <rect x="7" y="4" width="1" height="1" fill="#fff5fa" />
      <rect x="10" y="4" width="1" height="1" fill="#fff5fa" />
      <rect x="13" y="4" width="1" height="1" fill="#fff5fa" />

      {/* top cake layer */}
      <rect x="1" y="6" width="14" height="3" fill="#f2a6c8" />
      <rect x="1" y="6" width="14" height="1" fill="#ffc2dd" />

      {/* filling stripe */}
      <rect x="0" y="9" width="16" height="1" fill="#c76b9a" />

      {/* bottom cake layer */}
      <rect x="0" y="10" width="16" height="4" fill="#e58ab5" />
      <rect x="0" y="10" width="16" height="1" fill="#f2a6c8" />

      {/* plate */}
      <rect x="0" y="13" width="16" height="1" fill="#000080" opacity="0.5" />

      {/* sprinkles */}
      <rect x="2" y="7" width="1" height="1" fill="#4d94ff" />
      <rect x="5" y="8" width="1" height="1" fill="#66cc66" />
      <rect x="9" y="7" width="1" height="1" fill="#ffe066" />
      <rect x="12" y="8" width="1" height="1" fill="#ff9900" />
      <rect x="6" y="11" width="1" height="1" fill="#4d94ff" />
      <rect x="10" y="12" width="1" height="1" fill="#66cc66" />
    </svg>
  );
}