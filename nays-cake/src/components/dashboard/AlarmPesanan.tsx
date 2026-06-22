"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { usePesananBaru } from "@/hooks/usePesananBaru";

export function AlarmPesanan() {
  const { count, adaBaru, resetBaru } = usePesananBaru(15000);
  const [suaraAktif, setSuaraAktif] = useState(false);
  const [tampilBanner, setTampilBanner] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // siapkan elemen audio sekali
  useEffect(() => {
    audioRef.current = new Audio("/notif.mp3");
    audioRef.current.volume = 1.0;
  }, []);

  // saat ada pesanan baru → bunyikan + banner
  useEffect(() => {
    if (adaBaru) {
      setTampilBanner(true);
      if (suaraAktif && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      resetBaru();
    }
  }, [adaBaru, suaraAktif, resetBaru]);

  function aktifkanSuara() {
    // "unlock" autoplay: mainkan dalam handler klik
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        setSuaraAktif(true);
      }).catch(() => setSuaraAktif(true));
    } else {
      setSuaraAktif(true);
    }
  }

  return (
    <>
      {/* Tombol aktifkan suara (muncul kalau belum aktif) */}
      {!suaraAktif && (
        <button
          onClick={aktifkanSuara}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600"
        >
          <BellOff className="w-4 h-4" /> Aktifkan suara
        </button>
      )}

      {/* Banner pesanan baru */}
      {tampilBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 bg-green-600 text-white rounded-xl shadow-xl animate-bounce">
          <Bell className="w-5 h-5" />
          <span className="font-bold">Pesanan baru masuk! ({count} menunggu)</span>
          <button onClick={() => setTampilBanner(false)} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
