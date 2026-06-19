# Design assets — MCP tooling (optional)

Use these MCP servers to expand the Renaissance asset library. **Never commit API keys.**

## Unsplash MCP

Repository: [cevatkerim/unsplash-mcp](https://github.com/cevatkerim/unsplash-mcp)

1. Create an app at [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications).
2. Add to Cursor MCP config with `UNSPLASH_ACCESS_KEY` in env.
3. Search and download into `Design assets/Renaissance aesthetics/`.
4. Run `node scripts/optimize-plates.mjs` to publish to `public/`.

## 21st.dev Magic MCP

For component discovery during design iteration (RevealWave, etc.), not production runtime.

```bash
# Store API_KEY in env only — rotate if exposed in chat
claude mcp add magic --scope user --env API_KEY="$MAGIC_API_KEY" -- npx -y @21st-dev/magic@latest
```

## Plate pipeline

| Script | Purpose |
|--------|---------|
| `node scripts/optimize-plates.mjs` | JPG plates → `public/` + `design-plates-manifest.json` |
| `node scripts/generate-brand-assets.mjs` | Favicon / OG from `brand/favicon-mark.svg` |

Current plate mapping:

| Public file | Source |
|-------------|--------|
| `manifesto-simon-plate.jpg` | simon-champagne-9nXws2I_kgo-unsplash.jpg |
| `vault-plate.jpg` | daniel-gregoire-N7dsOPLDk9I-unsplash.jpg |
| `email-atmosphere.jpg` | leonhard-niederwimmer-4kB471fxQnA-unsplash.jpg |
| `hero-plate.jpg` | (unchanged in phase A) |
