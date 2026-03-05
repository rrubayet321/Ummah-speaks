<div align="center">

<br/>

# أُمَّة · Ummah Speaks

### A quiet Islamic companion for the heart.

Share how you are feeling and receive a relevant hadith, a personalised AI reflection,  
accurate prayer times, and a digital dhikr counter — all in one beautifully crafted app.

<br/>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ummah--speaks.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://ummah-speaks.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq-AI-f55036?style=for-the-badge)](https://console.groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

</div>

---

## What is Ummah Speaks?

Ummah Speaks is a personal Islamic web app that meets you where you are emotionally. Write a few words about how you feel — anxious, grateful, lost, hopeful — and the app:

1. **Understands your intent** — Are you expressing a feeling, seeking guidance, or asking for a du'a for someone?
2. **Extracts the spiritual theme** using AI keyword analysis
3. **Finds a relevant hadith** from authenticated collections (Bukhari or Muslim)
4. **Fetches a matching Qur'anic verse** and the most relevant Name of Allah
5. **Writes a personalised reflection** — different every time, shaped to your exact words
6. **Saves everything privately** to your on-device journal

No accounts. No tracking. Your reflections stay on your device.

---

## Features

| Feature | Description |
|---|---|
| **Reflect (3 Modes)** | Choose between _Feeling_, _Seeking Guidance_, or _Du'a for Someone_ — the AI adapts its response to your intent |
| **Context-Aware AI** | Reflections are enriched with the Qur'anic verse, Name of Allah, and keyword relevant to your input |
| **Input Suggestions** | Rotating prompt chips help you discover what to type and get started quickly |
| **Voice Input** | Record your feeling by voice — transcribed live via Groq Whisper |
| **Du'a Refiner** | Paste a rough du'a and the app refines it into heartfelt Arabic supplication |
| **Salah Times** | Accurate daily prayer times for 100+ cities, live clock and next-prayer countdown |
| **Tasbeeh** | Digital dhikr counter — Subhanallah x 33, Alhamdulillah x 33, Allahu Akbar x 34 with haptic feedback |
| **Journal + Favourites** | Your last 10 reflections saved privately; star any entry to pin it to your Favourites |
| **Islamic Date** | Hijri calendar date displayed on the reflect screen |
| **Share / Download** | Save your reflection card as a PNG image or share via the native share sheet |
| **PWA Ready** | Installable on iOS and Android like a native app |
| **Fully Responsive** | Mobile-first design; works beautifully from 320 px to wide desktop |
| **Minimalist Dark Theme** | Pure solid dark neutral background (`#111111`) — no gradients or textures |
| **Rate Limiting** | API routes are protected with per-IP rate limiting to prevent abuse |
| **Input Validation** | All API payloads validated with Zod schemas — resistant to prompt injection |

---

## Tech Stack

| Technology | Role |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | React framework — pages, layouts, server-side API routes |
| [TypeScript 5](https://typescriptlang.org) | Type safety throughout the entire codebase |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling with CSS custom properties |
| [Groq API](https://console.groq.com) | Ultra-fast LLM (Llama 3) for keyword extraction, reflections, du'a refinement |
| [Groq Whisper](https://console.groq.com) | Voice-to-text transcription for hands-free input |
| [Zod](https://zod.dev) | Runtime schema validation for all API request bodies |
| [Adhan.js](https://github.com/batoulapps/adhan-js) | Offline Islamic prayer time calculations (Muslim World League method) |
| [Hadith API](https://hadithapi.pages.dev) | Authenticated hadith search across Bukhari & Muslim |
| [Al-Quran Cloud API](https://alquran.cloud/api) | Qur'anic verse lookup by keyword |
| [html2canvas](https://html2canvas.hertzen.com) | Capture and download reflection cards as PNG images |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display) | Clean, modern minimalist typography |
| [Amiri](https://fonts.google.com/specimen/Amiri) | Arabic script rendering |

---

## Architecture

### High-level overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  page.tsx    │  │  Journal.tsx │  │  SalahTimings.tsx    │  │
│  │  (main app)  │  │  Favourites  │  │  Tasbeeh.tsx         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                 │                                     │
│         │  fetch()        │  localStorage                       │
│         ▼                 ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Next.js App Router (Edge/Node)               │  │
│  │                                                           │  │
│  │  /api/chat        → keyword extraction                   │  │
│  │  /api/hadith      → hadith lookup                        │  │
│  │  /api/quran       → Qur'anic verse lookup                │  │
│  │  /api/reflection  → personalised AI reflection           │  │
│  │  /api/refine      → du'a refinement                      │  │
│  │  /api/transcribe  → voice → text                         │  │
│  └───────────┬───────────────────────┬───────────────────────┘  │
└──────────────┼───────────────────────┼──────────────────────────┘
               │                       │
               ▼                       ▼
   ┌───────────────────┐   ┌──────────────────────────┐
   │     Groq API      │   │     External Data APIs   │
   │                   │   │                          │
   │  Llama 3 (LLM)    │   │  hadithapi.pages.dev     │
   │  ├ keyword extract│   │  alquran.cloud/api       │
   │  ├ reflection gen │   │  (Qur'anic verses)       │
   │  ├ du'a refiner   │   │                          │
   │  └ Whisper (STT)  │   │  Adhan.js (offline)      │
   └───────────────────┘   │  (prayer time calc)      │
                           └──────────────────────────┘
```

### Request flow — Reflect screen

```
User types feeling
       │
       ▼
[1] POST /api/chat
    └─ Groq Llama 3 extracts a 1-2 word Islamic keyword
       │
       ▼
[2] POST /api/hadith  ──┐
    POST /api/quran   ──┤  Parallel fetches once keyword is known
    (Names of Allah   ──┘  matched client-side from names-of-allah.json)
       │
       ▼
[3] POST /api/reflection
    └─ System prompt shaped by intent mode (feeling / guidance / dua-for)
    └─ User prompt enriched with: keyword · Name of Allah · Qur'anic verse · hadith
    └─ Groq Llama 3 returns a 2–3 sentence personalised reflection
       │
       ▼
[4] Reflection card rendered
    └─ User can: Save to Journal · Star as Favourite · Share as PNG
```

### Data layer

| Layer | Technology | What lives here |
|---|---|---|
| Client state | React `useState` / `useEffect` | UI state, fetched results, input value |
| Persistence | Browser `localStorage` | Journal entries (last 10), Favourites |
| Server state | Next.js API Routes (stateless) | No database — every request is independent |
| Secrets | `.env.local` → Vercel env vars | `GROQ_API_KEY` only |

### Security model

| Concern | Mitigation |
|---|---|
| Prompt injection | Zod trims and length-caps all string inputs before they reach the LLM |
| API abuse | Per-IP in-memory rate limiter on every API route (`lib/rate-limit.ts`) |
| Secret exposure | API key lives server-side only; never sent to the browser |
| Data privacy | No database — journal entries never leave the user's device |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- A free [Groq API key](https://console.groq.com) (no credit card required)

### 1. Clone the repository

```bash
git clone https://github.com/rrubayet321/Ummah-speaks.git
cd Ummah-speaks/ummah-speaks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Powers keyword extraction, AI reflections, du'a refinement, and voice transcription via Groq |

> **Security note:** Never commit `.env.local` to version control. It is already in `.gitignore`.

---

## Project Structure

```
ummah-speaks/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Extracts emotional keyword from user input
│   │   ├── hadith/route.ts        # Fetches relevant hadith by keyword
│   │   ├── quran/route.ts         # Fetches a matching Qur'anic verse
│   │   ├── reflection/route.ts    # Generates personalised AI reflection
│   │   ├── refine/route.ts        # Refines a rough du'a into Arabic supplication
│   │   └── transcribe/route.ts    # Voice-to-text via Groq Whisper
│   ├── components/
│   │   ├── BottomNav.tsx          # Mobile bottom bar + desktop top navigation
│   │   ├── Journal.tsx            # Saved reflections + Favourites section
│   │   ├── SalahTimings.tsx       # Prayer times with live clock and city picker
│   │   ├── Tasbeeh.tsx            # Dhikr counter with circular progress ring
│   │   └── ui.tsx                 # Shared BackButton and CompactBrand atoms
│   ├── data/
│   │   ├── cities.ts              # City list with coordinates and timezones
│   │   └── names-of-allah.json    # 99 Names of Allah with transliterations and meanings
│   ├── lib/
│   │   ├── journal.ts             # localStorage read/write helpers
│   │   ├── rate-limit.ts          # In-memory per-IP rate limiter for API routes
│   │   └── validation.ts          # Zod schemas for all API request bodies
│   ├── globals.css                # CSS custom properties, design tokens, component styles
│   ├── layout.tsx                 # Root layout, font loading, PWA metadata
│   └── page.tsx                   # Main app — all screens and state management
├── public/
├── .env.example
├── .gitignore
├── LICENSE
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Deployment

Deploy in one click with [Vercel](https://vercel.com) (free tier):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import this repo
3. Add `GROQ_API_KEY` under **Environment Variables**
4. Click **Deploy**

Your app will be live at a `*.vercel.app` URL within seconds.

---

## Privacy

- All journal entries live in your browser's `localStorage` — they **never leave your device**.
- The only data sent to an external server is the text you type (sent to Groq to generate a reflection). No account, no name, no identifiers are transmitted.
- API routes are rate-limited and all inputs are validated with Zod to prevent abuse.

---

## Roadmap

- [ ] Offline support (Service Worker caching)
- [ ] Multi-language reflections (Arabic, Urdu, Malay)
- [ ] Dark / Light mode toggle
- [ ] Share to social media (reflection card image)
- [ ] Weekly Hadith email subscription
- [ ] Community du'a board (optional, opt-in)

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change, then fork the repository and submit a pull request.

```bash
# Fork → clone your fork
git clone https://github.com/<your-username>/Ummah-speaks.git

# Create a feature branch
git checkout -b feat/your-feature-name

# Commit your changes
git commit -m "feat: describe your change"

# Push and open a Pull Request
git push origin feat/your-feature-name
```

---

## Licence

MIT © [Rubayet Hassan](mailto:rrubayet321@gmail.com)

This project is open source under the MIT License. You are free to fork, adapt, and build upon it for your own Islamic projects — just keep the copyright notice intact.

---

## Author

Built by **Rubayet Hassan**

[![GitHub](https://img.shields.io/badge/GitHub-rrubayet321-181717?style=flat-square&logo=github)](https://github.com/rrubayet321)
[![Email](https://img.shields.io/badge/Email-rrubayet321%40gmail.com-ea4335?style=flat-square&logo=gmail&logoColor=white)](mailto:rrubayet321@gmail.com)

---

<div align="center">

*Built with love for the Ummah.*

**بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ**

</div>
