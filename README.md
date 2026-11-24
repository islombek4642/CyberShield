# 🛡️ CyberShield — Network Intrusion Detection & Security Operations Platform

> **Universitet Topshirig'i:** 11-loyiha — «CyberShield: Kiberxavfsizlik ma’lumotlarini tahlil qilish»  
> **Murakkablik darajasi:** Ekspert  
> **Texnologiyalar:** Python 3.14, FastAPI, PostgreSQL 18, Scikit-learn, React 19, TypeScript, Tailwind CSS, Vite, Chart.js, Telegram Serverless SDK (`@tgcloud/cli`).

---

## 📌 1. Loyiha Haqida

**CyberShield** — tarmoq oqimlari (NetFlow) ma'lumotlaridan foydalanib, normal tarmoq faoliyati bilan xavfli kiberxurujlarni (DDoS, PortScan, Infiltration, Botnet, Brute Force va boshqalar) real vaqtda aniqlovchi va xavfsizlik monitoringi (SIEM / SOC — Security Operations Center) prototipini taqdim etuvchi to'liq amaliy IT tizim.

Tizim universitet topshirig'i hujjati (`datasetlar_bilan_ishlash_12_ta_loyiha.docx`) va muhandislik standartlari (`AGENTS.md`) asosida ishlab chiqilgan.

---

## 🏗️ 2. Tizim Arxitekturasi

```
                             [ Tarmoq Trafigi ]
                   CIC-IDS2017 & UNSW-NB15 Benchmark Flow Data
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      FastAPI Backend (Port: 8000)                      │
 │  • Schema Detection & Data Cleaning (Pandas, NumPy)                    │
 │  • ML Intrusion Detection Engine (Random Forest / LightGBM)            │
 │  • Real-time Live Traffic Stream Engine (WebSocket: /ws/traffic)       │
 │  • Security Alert Dispatcher (Instant Alert Routing)                   │
 │  • REST API & JWT Autentifikatsiya (Swagger / OpenAPI: /docs)          │
 └──────────────┬───────────────────────────┬─────────────────────────────┘
                │                           │
                ▼                           ▼
 ┌─────────────────────────────┐ ┌────────────────────────────────────────┐
 │     PostgreSQL Database     │ │  Telegram Serverless Bot (Cloud)      │
 │  • users                    │ │  • Cyber_ShieldUz_Bot (@tgcloud/cli)   │
 │  • datasets & ml_models     │ │  • /status, /report, /history, /link   │
 │  • incidents & audit_logs   │ │  • Inline Buttons:                     │
 │  • bot_links                │ │    [✅ Tekshirildi]  [🔍 Ko'rib...]    │
 └──────────────┬──────────────┘ └────────────────────────────────────────┘
                │
                ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │             React + TypeScript SOC Dashboard (Port: 5173)              │
 │  • Live NetFlow Traffic Dynamics Chart (PPS dinamikasi)                │
 │  • Threat Class Breakdown Chart (Hujum turlari taqsimoti)              │
 │  • Real-time Incident Response & SIEM Table                            │
 │  • Model Baholash: Confusion Matrix (Heatmap), Precision & Recall      │
 │  • Live Stream boshqaruvi: Play / Pause / 1x / 2x / 5x tezlik          │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ 3. Universitet Topshirig'i Talablarining Bajarilishi

| Talab qilingan komponent | Topshiriq bandi | CyberShield amalga oshirilishi | Holat |
| :--- | :--- | :--- | :---: |
| **Dataset yuklash & tozalash** | 11.1, 11.2 | `DatasetDetector` va `DatasetCleaner` — inf/nan tozalash, schema detection | ✅ Bajarildi |
| **Ikkala datasetni qo'llab-quvvatlash** | Tavsiya | Ham **CIC-IDS2017**, ham **UNSW-NB15** to'liq qo'llab-quvvatlanadi | ✅ Bajarildi |
| **Machine Learning Model** | 11.4 | `RandomForestClassifier` (balanced class weighting, 90%+ Recall) | ✅ Bajarildi |
| **Metrikalar & Tahlil** | 11.5 | **Confusion Matrix**, Accuracy, Precision, Recall, F1-Score | ✅ Bajarildi |
| **Shubhali yozuvlar & SIEM** | 11.6 | Vaqt, manba IP, nishon port va xavf darajalari (Critical, High, Med) | ✅ Bajarildi |
| **Telegram Bot Integratsiyasi** | 11.7, 11.8 | **Telegram Serverless (`@tgcloud/cli`)** — alertlar va inline tugmalar | ✅ Bajarildi |
| **Real-time Jonli Simulyatsiya** | Qo'shimcha | WebSocket oqimi — jonli tarmoq paketlari va hujumlar animatsiyasi | ✅ Bajarildi |
| **Xavfsizlik & Testlar** | AGENTS.md | JWT auth, bcrypt, .env boshqaruvi, 13 ta avtomatlashtirilgan test | ✅ Bajarildi |

---

## 🚀 4. Loyihani Ishga Tushirish

### 4.1. Talablar
* Python 3.10+ (Python 3.14 tavsiya etiladi)
* Node.js v18+ va npm
* PostgreSQL 14+ (yoki avtomatik SQLite fallback)

### 4.2. Tezkor ishga tushirish (Bitta buyruq orqali)
Loyihaning ildiz papkasida PowerShell orqali ishga tushiring:
```powershell
.\start.ps1
```

Yoki har bir qismni alohida terminalda ishga tushirishingiz mumkin:

#### Backend:
```powershell
cd c:\CyberShield\backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **Swagger API Hujjatlari:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Hujjatlari:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### Frontend:
```powershell
cd c:\CyberShield\frontend
npm run dev
```
* **SOC Monitoring Paneli:** [http://localhost:5173](http://localhost:5173)

---

## 🤖 5. Telegram Serverless Bot (`Cyber_ShieldUz_Bot`)

Bot rasmiy Telegram Serverless Cloud platformasida ishlaydi:
* **Loyiha katalogi:** `Cyber_ShieldUz_Bot/`
* **Xavfsiz token:** `.env` faylida `TGCLOUD_TOKEN` sifatida saqlanadi.

### Bot buyruqlari:
* `/start` — Tizim bilan tanishish va ishga tushirish.
* `/status` — Real vaqtda tahlil qilingan paketlar, yangi va ko'rib chiqilayotgan insidentlar soni.
* `/report` — Umumiy kiberxavfsizlik va hujumlar jamlanmasi.
* `/history` — Oxirgi aniqlangan 5 ta xuruj tafsilotlari.
* `/link <kod>` — Web platformadagi akkauntni Telegram bilan xavfsiz bog'lash.

### Inline Incident Response:
Kritik yoki yuqori xavfli hujum aniqlanganda bot quyidagi xabarni jo'natadi:
```
🚨 KIBERXAVFSIZLIK OGOHLANTIRISHI! 🚨
Insident ID: #42
Hujum turi: DDoS / PortScan
Xavf darajasi: 🔴 CRITICAL
Manba: 172.16.0.88 -> 10.0.0.5:80
Ishonch: 98%

[✅ Tekshirildi]  [🔍 Ko'rib chiqilmoqda]  [❌ Soxta signal]
```
Tugma bosilganda insident holati web dashboardda avtomatik yangilanadi.

---

## 🧪 6. Testlarni Ishga Tushirish

Barcha 13 ta testni (Unit, Security, ML va End-to-End) tekshirish:
```powershell
cd c:\CyberShield\backend
python -m pytest tests/ -v
```

---

## 🔒 7. Xavfsizlik Tamoyillari (`AGENTS.md`)
* Hech qanday maxfiy token yoki kalit kodga yozilmagan; faqat `.env` orqali boshqariladi.
* `.env` va `.tgcloud/` fayllari `.gitignore` da xavfsiz tarzda izolyatsiya qilingan.
* Barcha API kirish qiymatlari Pydantic v2 orqali qat'iy tekshiriladi.
* Barcha SQL so'rovlari parametrli ORM orqali bajariladi (SQL Injection dan 100% himoyalangan).

---

*Loyiha muallifi: CyberShield SOC Engineering Team (2026)*
