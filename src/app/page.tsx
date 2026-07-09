"use client";
import { useState, useEffect } from "react";
import Bsod from "./components/Bsod";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import Gallery from "./components/Gallery";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import UploadModal from "./components/modals/UploadModal";
import Footer from "./components/Footer";

interface User {
  id: string;
  username: string;
  role: string;
}

export default function Home() {
  const [showBsod, setShowBsod] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ver todas");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json() as Promise<{ user: User | null }>)
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

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
        onLogout={handleLogout}
        user={user}
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

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={u => setUser(u)}
        />
      )}
      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onSuccess={u => setUser(u)}
        />
      )}
      {uploadOpen && user?.role === "admin" && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={handleRefresh}
          authorId={user.id}
        />
      )}
    </>
  );
}