This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Gemini API keys

The backend accepts one or more Gemini keys. Prefer a JSON array in `.env.local`:

```env
GEMINI_API_KEYS='["key-one", "key-two", "key-three"]'
GEMINI_MODEL=models/gemini-3.6-flash

# Autonomous complaint email delivery
AUTO_SUBMIT_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=CivicConnect <noreply@example.com>
```

Comma- or newline-separated values are also accepted. `GEMINI_API_KEY` remains
supported for a single key. Requests rotate through the configured keys, retry
on invalid-key, quota, rate-limit, and resource-exhaustion errors, and keep
per-process usage counters available through `geminiUsage()` without exposing
secret key values.

The autonomous complaint endpoint accepts `phase: "auto"` at
`/api/agent/submit`. It resolves the configured authority, drafts the message,
sends it through SMTP, and records the complaint without a confirmation step.
Email delivery is disabled unless `AUTO_SUBMIT_ENABLED=true` and all SMTP
variables are configured.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
