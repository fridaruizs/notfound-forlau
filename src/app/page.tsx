"use client";
import { useState } from "react";
import Bsod from "./components/Bsod";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import Gallery from "./components/Gallery";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import UploadModal from "./components/modals/UploadModal";
import Footer from "./components/Footer";

export default function Home() {
  const [showBsod, setShowBsod] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ver todas");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);

  function handleRefresh() {
    setRefreshKey(k => k + 1);
  }

  return (
    <>
      {showBsod && <Bsod onDone={() => setShowBsod(false)} />}

      <Header
        onLogin={() => { setLoginOpen(true); setRegisterOpen(false); }}
        onRegister={() => { setRegisterOpen(true); setLoginOpen(false); }}
        onUpload={() => setUploadOpen(true)}
        onShuffle={() => setShuffleKey(k => k + 1)}
      />

      <CategoryBar
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <main style={{ background: "var(--xp-bg)", minHeight: "calc(100vh - 120px)" }}>
        <Gallery
          activeCategory={activeCategory}
          refreshKey={refreshKey}
          shuffleKey={shuffleKey}
          onRefresh={handleRefresh}
        />
      </main>

      <Footer />

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} />}
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </>
  );
}