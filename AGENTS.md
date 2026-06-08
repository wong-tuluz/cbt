<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# CBT Monorepo

Nx v22.7.5 | pnpm | `packages/*`

## Packages

- **cbt-server** (`packages/cbt-server/`) — NestJS 11 API, Drizzle ORM (MySQL), Redis, RabbitMQ, Better Auth
- **cbt-front** (`packages/cbt-front/`) — Vue 3, Vite 7, Tailwind 4, shadcn-vue, Pinia, Vue Router
- **docker** — Multi-stage Dockerfile + compose (builds full stack)

## Commands

```sh
pnpm dev              # nx run-many -t dev (both servers)
pnpm build            # nx run-many -t build
pnpm test             # nx run-many -t test
pnpm lint             # nx run-many -t lint
```

| Scope | Key commands |
|-------|-------------|
| Server | `pnpm nx run cbt-server:dev` (watch), `pnpm nx run cbt-server:build`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:reset` (run inside `packages/cbt-server`) |
| Frontend | `pnpm nx run cbt-front:dev` (port 5173), `pnpm nx run cbt-front:build` (vue-tsc -b + vite build) |

## Database

- MySQL, schema in `packages/cbt-server/src/common/db/schema/*.ts`
- Migrations: `packages/cbt-server/drizzle/` (Drizzle Kit)
- `.env` at `packages/cbt-server/.env`, `packages/cbt-front/.env`
- `settings` table stores key-value JSON (sync state, OAuth tokens)

## Testing

- Server: Jest (inline config in `package.json`), spec files in `src/`, run `pnpm nx run cbt-server:test`
- Frontend: no test runner; typecheck via `vue-tsc -b` in build

## Notes

- Nx Cloud disabled (`neverConnectToCloud: true`)
- NestJS build via `nest build` (deleteOutDir), Jest inline via ts-jest
- Frontend path alias `@/` → `src/`
- All DB scripts use `tsx` directly (not NestJS)
