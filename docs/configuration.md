# Configuration Guide

## Environment

This repository is a frontend-only Vite project. There is no server runtime config or `.env` dependency in current implementation.

## Package Scripts

Defined in `package.json`:

- `npm run dev`: start Vite dev server
- `npm run build`: run TypeScript checks and create production build
- `npm run preview`: serve production build locally

## Build Configuration

Configured in `vite.config.ts`:

- React plugin enabled
- Base path: `/casino/` (for GitHub Pages deployment)
- Output directory: `dist/`
- Asset directory: `assets/`
- Hashed file names for cache-safe deploys

If you deploy outside `/casino/`, update the `base` value accordingly.

## TypeScript Configuration

`tsconfig.json` highlights:

- `target`: `ES2020`
- `moduleResolution`: `bundler`
- `strict`: `true`
- JSX runtime: `react-jsx`
- No emit in app config (`noEmit: true`)

`tsconfig.node.json` is used for Vite config typing.

## Styling Configuration

Tailwind is configured at runtime in `index.html` via CDN script (`tailwind.config`).

Practical implications:

- No Tailwind build pipeline or PostCSS utility generation step
- Utility classes are interpreted in browser at runtime
- Custom tokens and animations are defined inline in `index.html`
- Additional global utilities are defined in `index.css`

## Client-Side Storage Keys

Current keys used by the app:

- `satking_pro_v2`: primary session object
- `sound_enabled_v1`: audio toggle state
- `stake_welcome_v1`: welcome overlay display flag

Changing these keys will reset behavior for existing users.

## CI/CD Configuration

GitHub Actions workflow (`.github/workflows/main.yml`) does:

1. Checkout on push to `main`
2. Setup Node.js 20
3. Install dependencies
4. Build app
5. Upload `dist/` artifact
6. Deploy to GitHub Pages

## Local Development Checklist

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Validate production build: `npm run build`
4. Preview output when needed: `npm run preview`

## Troubleshooting

### App loads blank page on GitHub Pages

- Confirm `vite.config.ts` base path matches repository path.
- Confirm workflow deployed latest `dist/` artifact.

### Old or broken session behavior

- Use in-app hard reset from error boundary, or clear browser storage manually.

### Type errors on build

- Run `npm run build` locally and fix TypeScript errors before opening PR.
