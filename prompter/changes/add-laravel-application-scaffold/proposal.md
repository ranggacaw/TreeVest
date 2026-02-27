# Change: Add Laravel Application Scaffold

## Why

Treevest is currently in the documentation/planning phase with no codebase. Before any features (security, authentication, investments, etc.) can be implemented, we need a foundational Laravel application with the selected tech stack:

- Laravel 12.x (PHP 8.2+)
- Laravel Breeze (React + TypeScript variant)
- Inertia.js 2.x for SSR bridge
- Vite 7.x for asset building
- Tailwind CSS 3.x for styling

This is a **blocking dependency** for all other changes, including:
- `add-security-compliance-infrastructure` (EPIC-015)
- All feature EPICs (authentication, KYC, investments, payments, etc.)

Without this scaffold, no code can be written or tested.

## What Changes

This change creates the foundational Laravel application structure with all architectural decisions from AGENTS.md implemented:

**Core Laravel Setup:**
- Install Laravel 12.x via Composer
- Configure `.env` with database settings (MySQL for production, SQLite for testing)
- Set up directory structure: `app/`, `database/`, `routes/`, `resources/`, `config/`, `tests/`
- Configure database drivers: sessions, cache, and queues all use database driver

**Authentication Scaffold:**
- Install Laravel Breeze 2.x with React + TypeScript stack
- Set up authentication routes: login, register, password reset, logout
- Create base Inertia page components for auth flows
- Configure middleware: auth, guest, verified

**Frontend Stack:**
- Install Inertia.js 2.x (`@inertiajs/react`)
- Install React 18.x with TypeScript 5.x
- Install Tailwind CSS 3.x with `@tailwindcss/forms` plugin
- Configure Vite 7.x with `laravel-vite-plugin` and `@vitejs/plugin-react`
- Install Ziggy 2.x (`tightenco/ziggy`) for Laravel routes in JavaScript

**Development Tooling:**
- Configure Laravel Pint 1.x for code style
- Configure PHPUnit 11.x for testing (with Pest plugin support)
- Set up Concurrently for parallel dev server (`composer dev` script)
- Create `.env.example` with all required environment variables

**Git Configuration:**
- Create `.gitignore` for Laravel (vendor/, node_modules/, .env, storage/, etc.)
- Add `.editorconfig` for consistent code formatting

**Expected Deliverables:**
- Working Laravel 12 application
- Authentication pages (login, register, forgot password, dashboard)
- Base Inertia layout components
- Configured Vite build process
- Database migrations for users, sessions, cache, jobs tables
- Passing test suite (`php artisan test` succeeds)
- Working dev server (`composer dev` runs all services)

## Impact

**Affected Capabilities:**
- **NEW**: `application-foundation` — Core Laravel application structure
- **NEW**: `asset-pipeline` — Vite build process for React + TypeScript
- **NEW**: `authentication-scaffold` — Breeze auth pages and routes

**Affected Code/Systems:**
- **Creates entire codebase** — All Laravel directories and files
- Root directory: `composer.json`, `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `phpunit.xml`
- Configuration: `.env.example`, `.gitignore`, `.editorconfig`, `config/` files
- Database: Initial migrations for users, password_resets, sessions, cache, jobs
- Frontend: `resources/js/`, `resources/css/`, `resources/views/app.blade.php`

**Dependencies:**
- This is the **foundational change** — no prerequisites
- **Blocks**: ALL other changes (`add-security-compliance-infrastructure`, EPIC-001 through EPIC-015)

**Breaking Changes:**
- None (initial implementation)

**Migration Path:**
- N/A (fresh installation)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Version compatibility issues** — Laravel 12, React 18, Inertia 2 may have breaking changes | Medium | Use exact versions specified in AGENTS.md; test immediately after scaffold |
| **Database configuration errors** — MySQL vs SQLite setup may fail | Low | Use database-backed sessions/cache/queues as specified; test both drivers |
| **Vite build failures** — Asset compilation may fail in development | Medium | Follow Laravel Vite plugin documentation; ensure Node.js 18+ is installed |
| **Authentication scaffold conflicts** — Breeze React stack may not match customization needs | Low | Breeze provides starting point only; can be customized after scaffold |
| **Concurrently script issues** — Dev server orchestration may fail on Windows (Laragon) | Medium | Test `composer dev` on Windows; provide fallback instructions for manual startup |

## Open Questions

1. **Database name**: What should the production database name be? (e.g., `treevest`, `treevest_production`)
   - **Proposed**: `treevest` for production, `treevest_test` for local testing
   
2. **Application URL**: What should `APP_URL` be set to in `.env.example`?
   - **Proposed**: `http://localhost` for Laragon compatibility

3. **Sanctum API tokens**: Should Laravel Sanctum be configured now or deferred until API is needed?
   - **Proposed**: Include Sanctum (already installed with Laravel 12) but don't configure API routes yet

4. **Breeze variant**: Should we use Breeze with "dark mode" support or standard styling?
   - **Proposed**: Standard styling (dark mode can be added later as a feature)

5. **Testing setup**: Should we configure Pest PHP or stick with PHPUnit?
   - **Proposed**: PHPUnit (standard), but allow Pest plugin (AGENTS.md mentions "pest-plugin allowed")

## Success Criteria

- [ ] `composer install` completes successfully
- [ ] `npm install` completes successfully
- [ ] `php artisan serve` starts the development server
- [ ] `npm run dev` starts Vite development server
- [ ] `composer dev` runs all services concurrently (artisan serve, queue worker, Vite, Pail)
- [ ] Visit `http://localhost:8000` shows Laravel welcome page
- [ ] Visit `http://localhost:8000/login` shows Breeze login page (Inertia + React)
- [ ] Registration flow works end-to-end
- [ ] `php artisan test` runs and all tests pass
- [ ] `./vendor/bin/pint` code style check passes
- [ ] Database migrations run successfully: `php artisan migrate`
- [ ] Ziggy routes are accessible in TypeScript (`route('dashboard')`

## Related Documents

- **AGENTS.md**: Section 2 (Tech Stack), Section 11 (Coding Conventions)
- **PRD**: `prompter/prd.md` (no specific reference, but foundational requirement)
- **Blocks**: `add-security-compliance-infrastructure` (EPIC-015)
- **Project Conventions**: `prompter/project.md` (should be filled in after scaffold is complete)
