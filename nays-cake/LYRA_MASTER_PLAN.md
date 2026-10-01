# 👑 LYRA MASTER PLAN (HYBRID AI ECOSYSTEM)
**Pemilik (Owner):** Muhammad Riskal Fadhilla
**Dibuat Tanggal:** 29 September 2026

Dokumen ini adalah Kompas Utama (North Star) untuk semua AI Agent/Worker di dalam sistem Lyra. Jika kalian ter-reset atau kehilangan konteks, BACA DOKUMEN INI SEBELUM MELAKUKAN APAPUN.

---

## 🏗️ FASE 1: INFRASTRUKTUR HIBRIDA (AZURE ☁️ + PC LOKAL 🖥️) [STATUS: SEDANG BERJALAN]
- **Arsitektur:** Menggabungkan VPS Azure (sebagai *Front-End/Resepsionis*) dan PC Lokal Windows (RX 6700 XT) (sebagai *Back-End/Pabrik Backup*) menjadi satu "Mesin Berotak Dua".
- **Jembatan:** Menggunakan **Tailscale** untuk jaringan VPN 100.x.x.x, dan **Syncthing** untuk sinkronisasi data 1:1 *Real-Time*.
- **Mesin Kecerdasan (AI Engine):** 100% bergantung pada **9Router Lokal (Port 20128)** yang diisi amunisi *Grey Market API Key* Gemini Pro. Kita TIDAK menggunakan LLM Lokal (Llama/Qwen) di PC untuk menghemat listrik GPU, kecuali untuk tugas komputasi fisik (Scraping, Rendering).
- **Ketahanan (Self-Healing):** Ekosistem sudah Anti-Kiamat. Web Nays Cake dijaga *Linux Systemd*, Bot Kasir dijaga *Hermes Gateway*, Laporan dijaga *Crontab*.

## 💰 FASE 2: THE MICRO-SAAS (VENDING MACHINE GEMINI PRO) [STATUS: MENUNGGU EKSEKUSI]
- **Visi Bisnis:** Membangun Bot Telegram otomatis untuk menjual Akun/API Gemini Pro secara ritel (Sistem *Dropship* API).
- **Alur Kerja:** Pelanggan bayar via QRIS (Midtrans) -> NeonDB mencatat status lunas -> Sistem Lyra menembak API *aivaulthub.store* (Supplier) diam-diam -> Tautan Aktivasi dikirim otomatis ke Pelanggan.
- **Strategi:** Memutar modal kecil (Deposit Crypto/USDT ke supplier) untuk meraup untung margin +900% per akun. Sistem JIT (Just-in-Time), tanpa menimbun stok mati.

## 🚀 FASE 3: PROTOKOL EKSODUS AZURE (DOOMSDAY MIGRATION) [STATUS: PERSIAPAN]
- **Pemicu:** Saldo kredit $80 di VPS Azure habis dalam kurun waktu ~1 bulan.
- **Tindakan (Seamless Migration):** Karena data sudah tersinkronisasi 1:1 via Syncthing di Fase 1, kita tidak perlu memindahkan file manual. 
- **Solusi Jaringan Lokal (IP Publik):** Saat Azure dimatikan, PC Windows akan dinaikkan pangkatnya menjadi Server Utama. Kita akan menggunakan **Cloudflare Tunnel (Zero Trust)** di PC Lokal agar domain `nayscake.me` dan *Webhook* Telegram tetap bisa diakses dunia luar menembus WiFi rumahan tanpa harus pusing memikirkan *Port Forwarding*.

---
**END OF MASTER PLAN**
*Diinisiasi oleh J.A.R.V.I.S Think-Tank & Lyra Eksekutor*
## ⚖️ HUKUM EKSEKUSI MUTLAK
Semua pembuatan sistem (Syncthing, Bot Gemini, dll) WAJIB dilakukan secara OTOMATIS oleh AI (Lyra) dari 0 di VPS/PC. Dilarang keras memberikan tutorial menyuruh Bos (Muhammad Riskal Fadhilla) mengetik atau merakit kode secara manual. AI yang bekerja, Bos yang memantau.
