<div align="center">

# أُمَّة · Ummah Speaks

**A quiet Islamic companion for the heart.**

Share how you are feeling and receive a relevant hadith, a personalised reflection, accurate prayer times, and a digital dhikr counter — all in one beautifully crafted app.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://ummah-speaks.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

</div>

---

## What is Ummah Speaks?

Ummah Speaks is a personal Islamic web app that meets you where you are emotionally. You write a few words about how you feel — anxious, grateful, lost, hopeful — and the app:

1. Extracts the emotional theme using AI
2. Finds a relevant hadith from the authenticated collections (Bukhari or Muslim)
3. Writes a personalised reflection just for you
4. Saves everything privately to your on-device journal

No accounts. No data sent to a server. Your reflections stay on your device.

---

## Features

| Feature | Description |
|---|---|
| **Reflect** | Share your feelings and receive a relevant hadith + AI-written reflection |
| **Salah Times** | Accurate daily prayer times for 100+ cities, with a live clock and next-prayer badge |
| **Tasbeeh** | Digital dhikr counter guiding you through Subhanallah × 33, Alhamdulillah × 33, Allahu Akbar × 34 with haptic feedback |
| **Journal** | Your last 10 reflections saved privately to localStorage — expandable with full hadith |
| **Islamic Date** | Hijri date displayed in the reflect screen |
| **Share / Download** | Save your reflection card as an image or share via the native share sheet |
| **PWA Ready** | Installable on iOS and Android like a native app |
| **Fully Responsive** | Designed mobile-first; works beautifully from 320 px to wide desktop |
| **Clean Dark Theme** | Plain solid dark neutral background (`#111111`) — no textures or gradients, easy on the eyes on any screen |

---

## Tech Stack

| Technology | Role |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | React framework — pages, layouts, server-side API routes |
| [TypeScript 5](https://typescriptlang.org) | Type safety throughout |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling with CSS custom properties |
| [Groq API](https://console.groq.com) | Ultra-fast LLM for keyword extraction and personal reflections |
| [Adhan.js](https://github.com/batoulapps/adhan-js) | Offline Islamic prayer time calculations (Muslim World League method) |
| [Hadith API](https://hadithapi.pages.dev) | Authenticated hadith search across Bukhari & Muslim |
| [html2canvas](https://html2canvas.hertzen.com) | Capture and download reflection cards as PNG images |
| [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) + [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Elegant serif typography |
| [Amiri](https://fonts.google.com/specimen/Amiri) | Arabic script rendering |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- A free [Groq API key](https://console.groq.com)

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

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if .env.example exists, or create it manually
```

Open `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at [console.groq.com](https://console.groq.com) — no credit card required.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Powers keyword extraction and AI reflection generation via Groq's LLM API |

> **Note:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## Project Structure

```
app/
├── api/
│   ├── chat/route.ts          # Extracts emotional keyword from user input
│   ├── hadith/route.ts        # Fetches relevant hadith by keyword
│   └── reflection/route.ts    # Generates personalised reflection via Groq
├── components/
│   ├── BottomNav.tsx          # Mobile bottom bar + desktop top navigation
│   ├── Journal.tsx            # Saved reflection entries
│   ├── SalahTimings.tsx       # Prayer times with live clock and city picker
│   ├── Tasbeeh.tsx            # Dhikr counter with circular progress ring
│   └── ui.tsx                 # Shared BackButton and CompactBrand atoms
├── data/
│   └── cities.ts              # City list with coordinates and timezones
├── lib/
│   └── journal.ts             # localStorage read/write helpers
├── globals.css                # CSS custom properties, animations, component styles
├── layout.tsx                 # Root layout, font loading, PWA metadata
└── page.tsx                   # Main app — all screens and state management
```

---

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com) (free tier):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Under **Environment Variables**, add `GROQ_API_KEY`
4. Click **Deploy**

Your app will be live at a `*.vercel.app` URL within seconds.

---

## Privacy

- All journal entries are stored in your browser's `localStorage` — they never leave your device.
- The only data sent to external servers is your typed feeling text (sent to Groq to generate a reflection). No names or personal identifiers are transmitted.

---

## Licence

MIT © [Rubayet Hassan](mailto:rrubayet321@gmail.com)

This project is open source under the MIT License. You are free to fork, adapt, and build upon it for your own Islamic projects — just keep the copyright notice intact.

---

## Author

Built by **Rubayet Hassan**

- Email: [rrubayet321@gmail.com](mailto:rrubayet321@gmail.com)
- GitHub: [@rrubayet321](https://github.com/rrubayet321)

---

<div align="center">

*Built with love for the Ummah.*

**بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ**

</div>
