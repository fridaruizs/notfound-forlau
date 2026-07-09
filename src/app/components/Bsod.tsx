"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/app/lib/LangContext";

export default function Bsod({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2800);
    const t2 = setTimeout(() => onDone(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <>
      <style>{`
        .bsod {
          position: fixed; inset: 0;
          background: #0000AA; color: #AAAAAA;
          font-family: 'Courier New', monospace;
          font-size: 14px; padding: 40px 60px;
          z-index: 99999; transition: opacity 0.4s; line-height: 1.6;
        }
        .bsod.fade { opacity: 0; pointer-events: none; }
        .bsod-title {
          background: #AAAAAA; color: #0000AA;
          font-weight: bold; padding: 2px 8px;
          display: inline-block; margin-bottom: 20px;
        }
        .bsod p { margin-bottom: 12px; }
        .bsod-bar-wrap { margin-top: 20px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .bsod-bar-outer { display: inline-block; width: 200px; height: 14px; background: #0000AA; border: 1px solid #AAAAAA; }
        .bsod-bar-inner { height: 100%; background: #AAAAAA; width: 0%; animation: bsodload 2.4s linear forwards; }
        @keyframes bsodload { to { width: 100%; } }
        @media (max-width: 520px) { .bsod { padding: 24px 20px; font-size: 12px; } .bsod-bar-outer { width: 140px; } }
      `}</style>
      <div className={`bsod${fading ? " fade" : ""}`}>
        <div className="bsod-title">Windows</div>
        <p>{t("bsodLine1")}<br />{t("bsodLine2")}</p>
        <p>
          *  {t("bsodLine3")}<br />
          *  {t("bsodLine4")}<br />
          &nbsp;&nbsp;&nbsp;{t("bsodLine5")}
        </p>
        <p>{t("bsodLine6")} <span className="blink">_</span></p>
        <div className="bsod-bar-wrap">
          <span>{t("bsodLoading")}</span>
          <div className="bsod-bar-outer"><div className="bsod-bar-inner" /></div>
        </div>
      </div>
    </>
  );
}