# 🌤️ BlueSky AI — Automated Social Media Agent

> **AI-powered Bluesky posting automation with real-time Telegram & WhatsApp alerts.**

BlueSky AI is a full-stack web application that automates your Bluesky social media presence using AI-generated content. It handles post generation, scheduling, publishing, and sends you real-time notifications via Telegram and WhatsApp whenever automation activity occurs.

---

## ✨ Features

- **AI Post Generation** — Generates on-brand posts using OpenRouter (Gemini 2.5 Flash Lite) based on your configured topics, tone, and hashtags
- **Two-Stage Automation** — Separate cron jobs for generation and posting, each with configurable intervals
- **Posting Schedule** — Live countdown timers showing exactly when the next generation and publish will occur
- **Post Management** — View, retry, and manually trigger posts from a dedicated posts dashboard
- **Telegram Alerts** — Real-time bot notifications for every automation event (generation, success, failure, retries)
- **WhatsApp Alerts** — Maytapi-powered WhatsApp delivery for the same events, sent to your mobile
- **Settings UI** — Configure all integration credentials (Bluesky, Telegram, WhatsApp/Maytapi) directly in the app
- **PWA Support** — Installable progressive web app with offline capability
- **Clerk Authentication** — Secure sign-in with social providers and email

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, HeroUI component library |
| **Backend / DB** | Convex (real-time database + serverless functions + cron jobs) |
| **Auth** | Clerk |
| **AI** | OpenRouter → Google Gemini 2.5 Flash Lite |
| **Bluesky** | AT Protocol (`@atproto/api`) |
| **WhatsApp** | Maytapi (hosted WhatsApp gateway, no server required) |
| **Telegram** | Telegram Bot API |
| **Animations** | Framer Motion |

---

## 📁 Project Structure

```
blue-sky-web/
├── app/
│   ├── (public)/                  # Landing, features, docs pages
│   └── (protected)/
│       └── (features)/
│           ├── dashboard/          # Main control dashboard
│           ├── schedule/           # Posting schedule + countdowns
│           ├── posts/              # Post history & management
│           ├── ai/                 # AI strategy configuration
│           ├── profile/            # User profile
│           └── settings/           # Credentials + integrations
├── components/
│   ├── Navbar.tsx                  # Responsive navbar with mobile drawer
│   ├── Sidebar.tsx                 # Desktop sidebar navigation
│   └── AuthModal.tsx               # Auth modal (sign-in / sign-up)
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── users.ts                    # User & preferences mutations/queries
│   ├── posting.ts                  # Post generation, publishing, cron logic
│   ├── bluesky.ts                  # AT Protocol integration
│   ├── openrouter.ts               # AI content generation
│   ├── telegram.ts                 # Telegram Bot API notifications
│   ├── whatsapp.ts                 # Maytapi WhatsApp notifications
│   └── crons.ts                    # Scheduled cron job definitions
└── public/                         # PWA icons, manifest, service worker
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0 or Node.js ≥ 18
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- A [Bluesky](https://bsky.app) account with an App Password
- An [OpenRouter](https://openrouter.ai) account
- *(Optional)* A [Maytapi](https://maytapi.com) account for WhatsApp
- *(Optional)* A Telegram Bot (via [@BotFather](https://t.me/BotFather))

### 1. Clone & install

```bash
git clone https://github.com/your-username/blue-sky-web.git
cd blue-sky-web
bun install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 3. Set Convex environment variables

```bash
npx convex env set OPENROUTER_API_KEY your_openrouter_key
npx convex env set TELEGRAM_BOT_TOKEN your_bot_token
npx convex env set TELEGRAM_CHAT_ID your_chat_id
npx convex env set MAYTAPI_PRODUCT_ID your_product_id
npx convex env set MAYTAPI_PHONE_ID your_phone_id
npx convex env set MAYTAPI_API_TOKEN your_api_token
npx convex env set MAYTAPI_TARGET_NUMBER 256742736501
```

> **Note:** Telegram and Maytapi credentials can also be configured per-user from the **Settings → Integrations** panel inside the app, overriding the global defaults.

### 4. Start development

```bash
# Terminal 1 — Convex backend
npx convex dev

# Terminal 2 — Next.js frontend
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Configuration

### Bluesky Credentials
Set your Bluesky handle and App Password from **Settings → Bluesky Connection**.  
Generate an App Password at: `bsky.app → Settings → Privacy and Security → App Passwords`

### AI Strategy
Configure from **AI** → select your topics, tone (professional, casual, witty, etc.), hashtags, and posting intervals.

### Notification Integrations

#### Telegram
1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the token
2. Send `/start` to your bot to initialise the chat
3. Enter the Bot Token and Chat ID in **Settings → Integrations**

#### WhatsApp (Maytapi)
1. Register at [maytapi.com](https://maytapi.com) and create a phone slot
2. Scan the QR code with your WhatsApp to link the number
3. Enter your Product ID, Phone ID, API Token, and target number in **Settings → Integrations**

---

## 🔔 Notification Events

Both Telegram and WhatsApp receive alerts for:

| Event | Message |
|---|---|
| Post Generated | 📝 New post queued |
| Post Published | 🚀 Post live with Bluesky link |
| Post Failed | ❌ Error with details |
| Manual Retry | 🔄 Retry triggered |
| Manual Post Now | 📤 Immediate post published |

---

## 🛠️ Development

```bash
# Type check
bun run build

# Lint
bun run lint

# Deploy Convex functions
npx convex deploy
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
