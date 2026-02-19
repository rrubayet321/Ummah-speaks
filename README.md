# Ummah Speaks

A quiet Islamic web app where you can share how you're feeling and receive personalised hadith guidance, reflections, prayer times, and dhikr.

Built with love for the Ummah. 🕌

---

## Features

- **Mood & Feelings** — Type how you feel and receive a relevant hadith with a personal AI-written reflection
- **Salah Timings** — Accurate daily prayer times based on your location (powered by the Adhan library)
- **Tasbeeh / Dhikr** — A digital counter for your remembrance of Allah
- **Journal** — Write and save your personal reflections locally
- **Islamic Date** — Displays the current Hijri date
- **PWA Ready** — Can be installed on your phone like a native app

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | React framework (frontend + backend API routes) |
| [TypeScript](https://typescriptlang.org) | Type-safe JavaScript |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Groq API](https://console.groq.com) | AI-powered personal reflections (fast LLM) |
| [Google Generative AI](https://ai.google.dev) | Additional AI capabilities |
| [Adhan](https://github.com/batoulapps/adhan-js) | Islamic prayer time calculations |
| [Hadith API](https://hadithapi.pages.dev) | Fetching hadiths |
| [html2canvas](https://html2canvas.hertzen.com) | Save/share reflections as images |

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/rrubayet321/Ummah-speaks.git
cd Ummah-speaks
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root folder (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your real API key:

```
GROQ_API_KEY=your_actual_key_here
```

You can get a free Groq API key at [https://console.groq.com](https://console.groq.com).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `GROQ_API_KEY` | API key for Groq's AI model (used for generating personal reflections) | [console.groq.com](https://console.groq.com) |

> ⚠️ Never commit your `.env.local` file to GitHub. It is already in `.gitignore`.

---

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com) (free tier available):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repo
3. Add your `GROQ_API_KEY` under **Environment Variables** in the Vercel dashboard
4. Click **Deploy** — your app will be live with a public URL

---

## Licence

This project is open source and free to use.
