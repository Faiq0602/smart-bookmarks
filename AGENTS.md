# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/app` (App Router). Start with `src/app/page.tsx` and shared shell in `src/app/layout.tsx`.
- Global styles are in `src/app/globals.css`.
- Static assets (icons, SVGs) live in `public/` and are served from `/` paths.
- Build output is generated in `.next/` (do not edit or commit).
- Root config files: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`.

## Build, Test, and Development Commands
- `npm run dev`: starts the Next.js dev server at `http://localhost:3000`.
- `npm run build`: creates a production build.
- `npm run start`: runs the production build locally.
- `npm run lint`: runs ESLint with Next.js core-web-vitals + TypeScript rules.

Example flow:
```bash
npm run lint
npm run build
npm run dev
```

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts` / `.tsx`) with React 19 + Next.js 16.
- Indentation: 2 spaces; keep imports grouped and remove unused code.
- Components: `PascalCase` for reusable components; route files remain framework-standard (`page.tsx`, `layout.tsx`).
- Variables/functions: `camelCase`; constants: `UPPER_SNAKE_CASE` when truly constant.
- Use ESLint as the source of truth before opening a PR.

## Testing Guidelines
- No test framework is configured yet in `package.json`.
- Minimum gate today: `npm run lint` and `npm run build` must pass.
- When adding tests, colocate near source (`src/**/__tests__`) or use `*.test.ts(x)` naming and document the command in `package.json`.

## Commit & Pull Request Guidelines
- Current history uses short, imperative commits (example: `Initial Next.js app setup`).
- Follow the same style: one focused change per commit, concise subject line.
- PRs should include:
  - Clear summary of what changed and why.
  - Linked issue/task when applicable.
  - UI screenshots or short recordings for visual updates.
  - Verification notes listing commands run (for example, `npm run lint`, `npm run build`).

## Security & Configuration Tips
- Keep secrets in `.env.local`; never commit environment files with credentials.
- Validate production behavior with `npm run build && npm run start` before release.
