# BUILD

Build & deploy notes for phy6.ai. (Stub — expand as the deploy pipeline lands.)

## Local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

`npm run build` is expected to pass with **zero errors and zero ESLint errors**.

## Deploy target

Standard serverless **Next.js on Vercel**. There is intentionally **no**
`output: 'export'` in `next.config.ts`, so server routes / API handlers remain
possible. No environment variables are required to build or run the current
single page.

## Pre-launch checklist

- [ ] Replace the Formspree placeholder in `src/components/email-capture.tsx`
      (`https://formspree.io/f/REPLACE_ME`) with a real form ID.
- [ ] Replace footer link placeholders (X, GitHub `href="#"`; email
      `hello@phy6.ai`) in `src/components/site-footer.tsx`.
- [ ] (Optional) Add a real favicon / OG image; `metadataBase` is set to
      `https://phy6.ai` in `src/app/layout.tsx`.
- [ ] `git init` + first commit (left to the shipping step on purpose).

## Notes

- Node 20+ recommended (built and verified on Node 25 / npm 11).
- Tailwind CSS v4 uses CSS-first config; tokens live in
  `src/app/globals.css` (`:root` + `@theme inline`), not a JS config file.
