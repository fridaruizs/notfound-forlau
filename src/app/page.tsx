"use client";
import { useState } from "react";
import Bsod from "@/app/components/Bsod";
import Header from "@/app/components/Header";
import CategoryBar from "@/app/components/CategoryBar";
import EmptyState from "@/app/components/EmptyState";
import LoginModal from "@/app/components/modals/LoginModal";
import RegisterModal from "@/app/components/modals/RegisterModal";
import Footer from "@/app/components/Footer";


export default function Home() {
  const [showBsod, setShowBsod] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ver todas");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      {showBsod && <Bsod onDone={() => setShowBsod(false)} />}

      <Header
        onLogin={() => { setLoginOpen(true); setRegisterOpen(false); }}
        onRegister={() => { setRegisterOpen(true); setLoginOpen(false); }}
      />

      <CategoryBar
        active={activeCategory}
        onChange={setActiveCategory}
      />

      <main style={{ background: "var(--xp-bg)", minHeight: "calc(100vh - 90px)" }}>
        <EmptyState category={activeCategory} />
      </main>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} />}
    
      <Footer />
    </>
  );
}