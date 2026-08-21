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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Skillcima production email delivery

Skillcima uses a Cloudflare Worker, Cloudflare Queues, Supabase, and Resend for durable course-confirmation delivery.

### Production secrets

The Worker requires these server-only Cloudflare secrets:

- `TURNSTILE_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SKILLCIMA_CONFIRMATION_TOKEN_SECRET`
- `RESEND_API_KEY`

Production secret values must never be committed to the repository.

### Non-secret production configuration

The Worker configuration contains:

- `SKILLCIMA_EMAIL_FROM` — `Skillcima <course@skillcima.com>`
- `SKILLCIMA_PUBLIC_ORIGIN` — `https://skillcima.com`

The Skillcima sending domain must be verified with the email provider before Queue delivery is activated.

### Queue safety

The application distinguishes:

- `skillcima-email` — primary delivery queue.
- `skillcima-email-dlq` — platform dead-letter reconciliation queue.

Queue consumers must not be activated until:

1. Supabase production migrations are current.
2. all required Worker secrets are configured securely.
3. the Resend sending domain is verified.
4. the primary Queue and DLQ exist.
5. retry and dead-letter configuration has been reviewed.
6. a controlled production confirmation-email proof is ready.

The Queue payload contains only the email-job identifier, job type, and schema version. Recipient PII is resolved server-side from Supabase only after a job is claimed.

### Deployment rule

Do not activate the primary Queue consumer before the production-delivery prerequisites above are satisfied.
