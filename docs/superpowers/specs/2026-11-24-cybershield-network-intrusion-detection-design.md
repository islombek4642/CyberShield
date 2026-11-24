# CyberShield: Network Intrusion Detection & Security Operations Platform
## Design Specification (Texnik Loyiha Hujjati)

- **Sana:** 2026-11-24
- **Loyiha turi:** Architectural (Full-stack Kiberxavfsizlik va Ma'lumotlar Tahlili Tizimi)
- **Topshiriq raqami:** 11-loyiha ("CyberShield — Kiberxavfsizlik ma’lumotlarini tahlil qilish")
- **Holati:** Tasdiqlangan / Spec Review

---

## 1. Loyiha Maqsadi va Kontekst

CyberShield — bu tarmoq oqimlari (network traffic flows) datasetlaridan foydalanib, normal tarmoq faoliyati bilan shubhali/zararli xurujlarni (Intrusion/Attacks) real vaqtda ajratuvchi, tasniflovchi va xavfsizlik monitoringi (SIEM/SOC prototipi) vazifasini bajaruvchi to'liq amaliy IT tizim.

Tizim quyidagi 5 ta asosiy komponentni o'zaro uzviy bog'laydi:
1. **Frontend:** React.js, TypeScript, Tailwind CSS (SOC Dashboard, jonli tarmoq oqimi grafigi, anomaliyalar tahlili, insidentlarni boshqarish).
2. **Backend:** Python, FastAPI (REST API, JWT autentifikatsiya, real-time WebSocket oqimi, biznes mantiqi).
3. **Database:** PostgreSQL (foydalanuvchilar, datasetlar, o'qitilgan modellar, insidentlar va audit jurnali).
4. **Dataset & ML Pipeline:** Pandas, NumPy, Scikit-learn / LightGBM (CIC-IDS2017 va UNSW-NB15 datasetlari, ma'lumotlarni tozalash, feature selection, nomutanosib sinflarni muvozanatlash, model baholash).
5. **Telegram Bot:** Telegram Serverless Cloud (`@tgcloud/cli`, `Cyber_ShieldUz_Bot`) — avtonom bulutda ishlovchi, xavfli hodisalarda real-time alertlar yuboruvchi va inline tugmalar orqali Incident Response boshqaruvini ta'minlovchi bot.

---

## 2. Tizim Arxitekturasi va Papkalar Strukturasi

```
CyberShield/
├── .env                       # Maxfiy konfiguratsiyalar (git-ignored)
├── .env.example               # Namuna sozlamalar
├── .gitignore                 # Maxfiy va vaqtinchalik fayllar filtri
├── AGENTS.md                  # Universal muhandislik va xavfsizlik standartlari
├── datasetlar_..._loyiha.docx # Universitet topshiriq hujjati
│
├── docs/                      # Hujjatlar va spesifikatsiyalar
│   └── superpowers/
│       ├── specs/             # Texnik loyiha hujjatlari (Design specs)
│       └── plans/             # Amalga oshirish rejalari (Implementation plans)
│
├── backend/                   # FastAPI Backend xizmati
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py         # JWT ro'yxatdan o'tish va kirish
│   │   │   │   ├── datasets.py     # CSV fayllar yuklash va statistik profil
│   │   │   │   ├── models.py       # ML modellarni boshqarish va metrikalar
│   │   │   │   ├── incidents.py    # Aniqlangan insidentlar va status yangilash
│   │   │   │   ├── stream.py       # Real-time WebSocket va simulyator
│   │   │   │   └── bot.py          # Telegram bot bilan integratsiya endpointlari
│   │   │   └── router.py           # API v1 markaziy yo'naltiruvchi
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic sozlamalari (.env o'qish)
│   │   │   ├── database.py         # SQLAlchemy engine va sessiyalar
│   │   │   └── security.py         # Passlib (bcrypt) va python-jose (JWT)
│   │   ├── models/                 # SQLAlchemy ORM modellari
│   │   │   ├── user.py
│   │   │   ├── dataset.py
│   │   │   ├── ml_model.py
│   │   │   ├── incident.py
│   │   │   └── bot_link.py
│   │   ├── schemas/                # Pydantic kirish/chiqish sxemalari
│   │   │   ├── auth.py
│   │   │   ├── dataset.py
│   │   │   ├── incident.py
│   │   │   └── stream.py
│   │   ├── services/               # Biznes mantiqi va algoritmlar
│   │   │   ├── dataset_service.py  # CSV tozalash va schema detection
│   │   │   ├── ml_service.py       # Feature selection, model train va inference
│   │   │   ├── stream_service.py   # Jonli paketlar simulyatori
│   │   │   └── alert_service.py    # Telegram botga alert jo'natish
│   │   └── main.py                 # FastAPI dasturi kirish nuqtasi
│   ├── tests/                      # Pytest avtomatlashtirilgan testlari
│   │   ├── test_auth.py
│   │   ├── test_dataset_cleaning.py
│   │   ├── test_ml_pipeline.py
│   │   └── test_incidents.py
│   └── requirements.txt
│
├── frontend/                  # React + TypeScript + Tailwind CSS ilovasi
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Sidebar, Header, NotificationBell
│   │   │   ├── dashboard/          # KpiCards, TrafficChart, AttackDistributionChart
│   │   │   ├── incidents/          # IncidentTable, IncidentFilter, StatusBadge
│   │   │   ├── ml/                 # ConfusionMatrixView, MetricsCard, FeatureImportance
│   │   │   └── stream/             # LiveStreamPlayer, ControlButtons
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DatasetsPage.tsx
│   │   │   ├── IncidentsPage.tsx
│   │   │   ├── ModelsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts              # Axios konfiguratsiyasi (JWT interceptor)
│   │   │   ├── websocket.ts        # Jonli oqim mijoz boshqaruvi
│   │   │   └── authService.ts
│   │   ├── types/                  # TypeScript interfeyslari
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── datasets/                  # Kiberxavfsizlik ma'lumotlar to'plami
│   ├── samples/
│   │   ├── cic_ids2017_sample.csv  # Tozalangan reprezentativ namuna (100k)
│   │   └── unsw_nb15_sample.csv    # Tozalangan reprezentativ namuna (100k)
│   └── raw/                        # Foydalanuvchi yuklagan to'liq CSV fayllar
│
└── Cyber_ShieldUz_Bot/        # Telegram Serverless Bot loyihasi
    ├── tgcloud/
    │   ├── handlers/
    │   │   ├── message.js          # /start, /link, /status, /report, /history
    │   │   └── callback_query.js   # Insident inline tugmalari (Resolve, In Review)
    │   ├── schema.js               # Bot ichki SQLite bazasi
    │   └── lib/
    │       └── backendClient.js    # FastAPI bilan HTTP aloqa (fetch)
    ├── package.json
    ├── tgcloud.jsonc
    └── docs/
```

---

## 3. Ma'lumotlar va Machine Learning Spesifikatsiyasi

### 3.1. Qo'llab-quvvatlanadigan Datasetlar va Avtomatik Schema Detection
* **CIC-IDS2017:**
  * Asosiy ustunlar: `Destination Port`, `Flow Duration`, `Total Fwd Packets`, `Total Backward Packets`, `Total Length of Fwd Packets`, `Fwd Packet Length Max`, `Flow Bytes/s`, `Flow Packets/s`, `Flow IAT Mean`, `Label`.
  * Hujum sinflari: *BENIGN (Normal), DDoS, PortScan, Bot, Infiltration, Web Attack, DoS GoldenEye, DoS Hulk*.
* **UNSW-NB15:**
  * Asosiy ustunlar: `dur`, `proto`, `service`, `state`, `spkts`, `dpkts`, `sbytes`, `dbytes`, `sttl`, `dttl`, `sload`, `dload`, `attack_cat`, `label`.
  * Hujum sinflari: *Normal, Fuzzers, Analysis, Backdoors, DoS, Exploits, Generic, Reconnaissance, Shellcode, Worms*.

### 3.2. Data Cleaning & Feature Engineering
1. **Cheksiz va bo'sh qiymatlar:** `np.inf`, `-np.inf` qiymatlari tegishli ustunning 99-persentil yoki maksimal xavfsiz qiymatiga almashtiriladi; `NaN` qiymatlar ustun medianasi bilan to'ldiriladi.
2. **Kategorik belgilarni kodlash:** `proto`, `service`, `state` kabi ustunlar One-Hot Encoding yoki Ordinal Encoding orqali raqamli ko'rinishga keltiriladi.
3. **Feature Selection:** 80+ ustun orasidan Random Forest / Mutual Information yordamida eng yuqori og'irlikka ega bo'lgan 18 ta asosiy xususiyat tanlanadi. Bu model inference tezligini 10 barobargacha oshiradi.

### 3.3. Modellash va Metrikalar
* **Algoritm:** Random Forest Classifier va LightGBM.
* **Class Imbalance:** `class_weight='balanced'` parametri orqali kam uchraydigan hujumlar (masalan Infiltration yoki Botnet) o'tkazib yuborilmasligi ta'minlanadi.
* **Metrikalar:**
  * **Precision:** Soxta ogohlantirishlar (False Positive) sonini kamaytirish.
  * **Recall:** Hujumlarni o'tkazib yubormaslik (False Negative ko'rsatkichini minimal darajada ushlab turish).
  * **F1-Score:** Precision va Recall ning garmonik o'rtachasi.
  * **Confusion Matrix:** 2x2 (Binary) va NxN (Multi-class) formatdagi chalg'ish matrisasi JSON ko'rinishida saqlanadi va frontendda vizualizatsiya qilinadi.

---

## 4. Backend va Database Spesifikatsiyasi

### 4.1. Ma'lumotlar Bazasi Sxemasi (PostgreSQL)

1. **`users` jadvali:**
   * `id` (UUID / Integer, PK)
   * `username` (VARCHAR, Unique, Indexed)
   * `email` (VARCHAR, Unique)
   * `hashed_password` (VARCHAR)
   * `role` (VARCHAR: 'admin', 'analyst')
   * `created_at` (TIMESTAMP)

2. **`datasets` jadvali:**
   * `id` (UUID / Integer, PK)
   * `user_id` (FK -> users.id)
   * `filename` (VARCHAR)
   * `dataset_type` (VARCHAR: 'CIC-IDS2017', 'UNSW-NB15')
   * `row_count` (INTEGER)
   * `status` (VARCHAR: 'uploaded', 'cleaned', 'analyzed')
   * `created_at` (TIMESTAMP)

3. **`ml_models` jadvali:**
   * `id` (UUID / Integer, PK)
   * `name` (VARCHAR)
   * `dataset_type` (VARCHAR)
   * `accuracy` (FLOAT)
   * `precision` (FLOAT)
   * `recall` (FLOAT)
   * `f1_score` (FLOAT)
   * `confusion_matrix` (JSON)
   * `feature_importance` (JSON)
   * `model_path` (VARCHAR)
   * `is_active` (BOOLEAN)
   * `created_at` (TIMESTAMP)

4. **`incidents` jadvali:**
   * `id` (UUID / Integer, PK)
   * `timestamp` (TIMESTAMP, Indexed)
   * `source_ip` (VARCHAR)
   * `dest_ip` (VARCHAR)
   * `dest_port` (INTEGER)
   * `protocol` (VARCHAR)
   * `attack_type` (VARCHAR, Indexed)
   * `severity` (VARCHAR: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
   * `confidence` (FLOAT)
   * `status` (VARCHAR: 'NEW', 'IN_REVIEW', 'RESOLVED', 'FALSE_POSITIVE', Indexed)
   * `reviewed_by` (VARCHAR)
   * `resolution_notes` (TEXT)

5. **`bot_links` jadvali:**
   * `id` (PK)
   * `user_id` (FK -> users.id)
   * `telegram_chat_id` (BIGINT, Unique)
   * `link_code` (VARCHAR)
   * `is_active` (BOOLEAN)
   * `linked_at` (TIMESTAMP)

### 4.2. Jonli Simulyator (Live Traffic Stream Engine)
* Backend ma'lumotlar bazasi yoki dataset namunasidan har `T` millisekundda (sozlanuvchi tezlik: 0.5s – 2s) navbatdagi tarmoq oqimlarini o'qiydi.
* ML inference xizmati oqimni tekshiradi:
  * Agar oqim Normal bo'lsa: oddiy metrika sifatida WebSocket orqali frontendga uzatiladi.
  * Agar oqim Hujum bo'lsa: `incidents` jadvaliga yoziladi, WebSocket orqali xavf signali bilan uzatiladi va agar xavf darajasi `CRITICAL` yoki `HIGH` bo'lsa, Telegram botga darhol alert uzatiladi.

---

## 5. Frontend SOC Monitoring Dashboard Spesifikatsiyasi

* **Design System:** Professional Dark Mode (Slate / Zinc / Cyber Blue / Crimson Red / Amber / Emerald).
* **Sahifalar:**
  1. **Dashboard (SOC Center):** Jonli PPS trafigi, real vaqtda yangilanuvchi anomaliyalar oqimi, xavf indikatorlari, simulyator pulti (Start/Pause/Speed).
  2. **Datasets:** CSV fayllarni yuklash, tozalash statistikasi, ustunlar tahlili.
  3. **Incidents (SIEM Explorer):** Barcha aniqlangan hodisalar bo'yicha to'liq jadval, ko'p parametrli filtrlar (sana, xavf, status, hujum turi), holatni o'zgartirish dialog oynasi.
  4. **ML Analytics:** Metrikalar, Confusion Matrix issiqlik xaritasi (Heatmap), Feature Importance ustunli diagrammasi.
  5. **Settings & Bot Link:** Telegram bot bilan bog'lanish uchun bir martalik QR/kod generatsiyasi, bildirishnoma sozlamalari.

---

## 6. Telegram Serverless Bot Spesifikatsiyasi (`Cyber_ShieldUz_Bot`)

* **Platforma:** Telegram Serverless Cloud (`@tgcloud/cli` SDK).
* **Fayllar tuzilishi:**
  * `tgcloud/handlers/message.js`: Buyruqlarni qabul qilish (`/start`, `/link <code>`, `/status`, `/report`, `/history`).
  * `tgcloud/handlers/callback_query.js`: Inline tugmalarni qayta ishlash (`action:resolve:<id>`, `action:review:<id>`, `action:false_positive:<id>`).
  * `tgcloud/lib/backendClient.js`: FastAPI REST API bilan xavfsiz HTTP so'rovlar yuborish.
* **Integratsiya mantiqi:**
  1. Administrator `/link <kod>` orqali o'z Telegram hisobini CyberShield tizimiga bog'laydi.
  2. Backend kritik hodisa paytida `https://api.telegram.org/bot<token>/sendMessage` orqali formatlangan ogohlantirish xabarini jo'natadi.
  3. Xabarda inline tugmalar bo'ladi: `[✅ Tekshirildi]`, `[🔍 Ko'rib chiqilmoqda]`, `[❌ Soxta signal]`.
  4. Tugma bosilganda Telegram Serverless handler FastAPI API ga POST so'rov yuboradi va hodisa holati yangilanadi.

---

## 7. Xavfsizlik va Muhandislik Kafolatlari (`AGENTS.md`)

1. **Maxfiy kalitlar:** `TGCLOUD_TOKEN`, `JWT_SECRET`, `DB_PASSWORD` faqat `.env` faylida saqlanadi. `.env` fayli `.gitignore` ga kiritilgan. `.env.example` namunaviy konfiguratsiya sifatida taqdim etiladi.
2. **Validatsiya va Sanitizatsiya:** Barcha API kirish qiymatlari Pydantic orqali tekshiriladi; fayllar formati, hajmi va ustunlar strukturasi tekshiriladi.
3. **TDD va Testlash:**
   * Backend testlari `pytest` bilan qamrab olinadi;
   * Noto'g'ri qiymatlar, cheksiz sonlar va bo'sh qiymatlarda tizim qulamasligi testlanadi.
4. **Hujjatlashtirish:**
   * FastAPI orqali avtomatik Swagger UI (`/docs`) va ReDoc (`/redoc`);
   * Loyihani o'rnatish, sozlash va ishga tushirish bo'yicha batafsil `README.md`.

---

## 8. Spec Self-Review

- [x] **Placeholder scan:** Hujjatda hech qanday "TBD", "TODO" yoki noaniq talablar yo'q.
- [x] **Internal consistency:** Barcha 5 ta komponent (Frontend, Backend, Database, Dataset/ML, Telegram Bot) o'zaro to'liq mos keladi.
- [x] **Scope check:** Loyiha universiteti talab qilgan 11-topshiriq mezonlarini 100% qamrab olgan va Telegram Serverless innovatsiyasi bilan boyitilgan.
- [x] **Ambiguity check:** Datasetlar, modellar, jadvallar va bot buyruqlari aniq nomlari va turlari bilan keltirilgan.
