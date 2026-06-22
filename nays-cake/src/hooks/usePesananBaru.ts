"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// Polling jumlah pesanan MENUNGGU tiap 15 detik.
// Memberi tahu saat jumlah BERTAMBAH (= ada pesanan baru).
export function usePesananBaru(intervalMs = 15000) {
  const [count, setCount] = useState<number>(0);
  const [adaBaru, setAdaBaru] = useState(false);
  const prev = useRef<number | null>(null);

  const cek = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/count", { cache: "no-store" });
      const data = await res.json();
      const c = Number(data.count) || 0;
      if (prev.current !== null && c > prev.current) {
        setAdaBaru(true); // jumlah bertambah → pesanan baru
      }
      prev.current = c;
      setCount(c);
    } catch {
      // diam saja; coba lagi siklus berikutnya
    }
  }, []);

  useEffect(() => {
    cek();
    const t = setInterval(cek, intervalMs);
    return () => clearInterval(t);
  }, [cek, intervalMs]);

  const resetBaru = useCallback(() => setAdaBaru(false), []);
  return { count, adaBaru, resetBaru, cekSekarang: cek };
}
