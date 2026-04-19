# Building an AI-Powered Bluesky Posting Web App
### Next.js · Convex · OpenRouter · Bluesky API · HeroUI

> **Your stack, your rules.** This guide is written specifically for your architecture: a Next.js web application where users configure posting preferences, Convex handles all backend logic and scheduled automation, OpenRouter generates the post content using AI, and the Bluesky API publishes everything. We use **HeroUI** for a premium, high-fidelity interface and **Bun** for fast package management and execution. No Linux servers. No self-hosted infrastructure. No DevOps.

---

## Table of Contents

1. [How Your System Works (The Big Picture)](#1-how-your-system-works-the-big-picture)
2. [Understanding the Bluesky API for This Stack](#2-understanding-the-bluesky-api-for-this-stack)
3. [Step 1 — User Onboarding in the Web App](#3-step-1--user-onboarding-in-the-web-app)
4. [Step 2 — Storing Bluesky Credentials Securely in Convex](#4-step-2--storing-bluesky-credentials-securely-in-convex)
5. [Step 3 — Calling OpenRouter to Generate Posts](#5-step-3--calling-openrouter-to-generate-posts)
6. [Step 4 — Publishing to Bluesky from Convex](#6-step-4--publishing-to-bluesky-from-convex)
7. [Step 5 — Automating Everything with Convex Cron Jobs](#7-step-5--automating-everything-with-convex-cron-jobs)
8. [Bluesky API — What You Actually Need to Know](#8-bluesky-api--what-you-actually-need-to-know)
9. [Rate Limits and How They Affect Your App](#9-rate-limits-and-how-they-affect-your-app)
10. [What to Store in Convex](#10-what-to-store-in-convex)
11. [The Full Data Flow, End to End](#11-the-full-data-flow-end-to-end)
12. [Edge Cases and Things to Plan For](#12-edge-cases-and-things-to-plan-for)

---

## 1. How Your System Works (The Big Picture)

Your app has four moving parts, each with a clear and distinct job:

**Next.js (Web Application)**
This is what your users see and interact with, built using **HeroUI** for beautiful, high-fidelity components. Users log in via the web interface, configure posting preferences, set schedules, and monitor published posts. The web app does not generate posts and does not call Bluesky directly — it is a dashboard and configuration interface. All heavy lifting happens in the backend.

**Convex (Backend + Database + Scheduler)**
Convex is your entire backend. It stores user data, holds Bluesky credentials, keeps a history of posts, and runs scheduled cron jobs. When a cron job fires, it reaches out to OpenRouter to generate content, then calls the Bluesky API to publish it. You never need a server running — Convex's cloud handles everything.

**OpenRouter (AI Content Generation)**
OpenRouter provides access to various AI models (GPT-4, Claude, Llama, etc.) through a single API. Convex calls OpenRouter with a prompt based on user settings, and the generated text is then forwarded to Bluesky.

**Bluesky API (Publishing)**
The final destination. Convex authenticates with Bluesky and sends the generated post to the user's profile.

---

## 2. Understanding the Bluesky API for This Stack

Bluesky uses the **AT Protocol**. You use an **App Password** for API access — a special password generated in the Bluesky settings that allows API access without exposing the user's main password.

**Key advantage:** No API keys or approval queues. Each user authenticates individually, and limits are per-account.

**Workflow:**
1. Authenticate to get a session token.
2. Create a post using that token.

---

## 3. Step 1 — User Onboarding in the Web App

Collect two things from the user in your Next.js interface:
1. **Bluesky handle** (e.g., `user.bsky.social`).
2. **Bluesky App Password** (e.g., `xxxx-xxxx-xxxx-xxxx`).

Instruct users to generate an App Password in their Bluesky settings. Use **HeroUI** input components and clear instructions to make this process seamless.

Beyond credentials, collect posting preferences: topics, tone (professional, casual, etc.), and frequency.

---

## 4. Step 2 — Storing Bluesky Credentials Securely in Convex

Your web app sends the details to Convex.
**Security:** Never store App Passwords in plain text or return them to the client. Use Convex actions for credential handling to ensure they stay server-side.

**Storage:** Handle, App Password (securely), preferences, schedule, and post history.

---

## 5. Step 3 — Calling OpenRouter to Generate Posts

Convex actions call OpenRouter to generate content. Use an API key stored as a Convex environment variable.

---

## 6. Step 4 — Publishing to Bluesky from Convex

Convex authenticates with Bluesky using the App Password, gets a session token, and publishes the post.

---

## 7. Step 5 — Automating Everything with Convex Cron Jobs

Convex cron jobs run automatically on your defined interval. The "posting scheduler" job checks who is due for a post and triggers the generation/publishing process. This replaces a dedicated Linux server entirely.

---

## 8. Bluesky API — What You Actually Need to Know

Endpoints:
- `com.atproto.server.createSession` (Auth)
- `com.atproto.repo.createRecord` (Post)

Base URL: `https://bsky.social`
Post limit: 300 characters.

---

## 9. Rate Limits and How They Affect Your App

Limits are per-account.
- Login: 30/5min, 300/day. Best practice: cache and reuse the session token in Convex.
- Posting: 5,000pts/hr, 35,000pts/day (approx 1,666 posts/hr).

---

## 10. What to Store in Convex

Tables needed:
- `users`: Credentials and session tokens.
- `preferences`: User settings and schedules.
- `postHistory`: Log of published posts.
- `cronLogs`: Debugging information.

---

## 11. The Full Data Flow, End to End

1. Cron fires in Convex.
2. Identifies users due for a post.
3. Convex Action fetches AI content from OpenRouter.
4. Convex Action publishes to Bluesky.
5. Success/failure is logged in the `postHistory` table.
6. The user views their history on their Next.js dashboard.

---

## 12. Edge Cases and Things to Plan For

- **Revoked App Password:** Prompt user to reconnect in the web dashboard.
- **OpenRouter/Bluesky failure:** Implement retries and logging in Convex.
- **Character limits:** Ensure AI output stays under 300 characters.
- **Costs:** Monitor Convex and OpenRouter usage.

---

*This architecture is serverless, using Next.js for the UI and Convex for all automation. No Linux boxes required.*
