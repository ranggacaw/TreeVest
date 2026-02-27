# Implementation Tasks

## 1. Install Laravel Framework

- [ ] 1.1 Run `composer create-project laravel/laravel:^12.0 temp_laravel` (create in temp directory)
- [ ] 1.2 Move all files from `temp_laravel/` to project root (preserving .git, prompter/, AGENTS.md)
- [ ] 1.3 Delete `temp_laravel/` directory
- [ ] 1.4 Verify `php artisan --version` shows Laravel 12.x
- [ ] 1.5 Update `composer.json` to ensure PHP >= 8.2 requirement

## 2. Configure Environment

- [ ] 2.1 Copy `.env.example` to `.env`
- [ ] 2.2 Generate application key: `php artisan key:generate`
- [ ] 2.3 Configure database in `.env`: `DB_CONNECTION=mysql`, `DB_DATABASE=treevest`
- [ ] 2.4 Configure session driver: `SESSION_DRIVER=database`
- [ ] 2.5 Configure cache driver: `CACHE_STORE=database`
- [ ] 2.6 Configure queue driver: `QUEUE_CONNECTION=database`
- [ ] 2.7 Update `.env.example` with all Treevest-specific environment variables

## 3. Install Laravel Breeze (React + TypeScript)

- [ ] 3.1 Run `composer require laravel/breeze --dev`
- [ ] 3.2 Run `php artisan breeze:install react --typescript`
- [ ] 3.3 Verify `resources/js/` contains TypeScript files (`.tsx`)
- [ ] 3.4 Verify `tsconfig.json` exists
- [ ] 3.5 Verify Breeze routes exist in `routes/auth.php`

## 4. Configure Frontend Stack

- [ ] 4.1 Run `npm install` to install dependencies
- [ ] 4.2 Verify `@inertiajs/react` is installed (check `package.json`)
- [ ] 4.3 Verify `react` and `react-dom` version 18.x
- [ ] 4.4 Verify `tailwindcss` version 3.x
- [ ] 4.5 Verify `vite` version 7.x (or compatible)
- [ ] 4.6 Install Ziggy: `composer require tightenco/ziggy`
- [ ] 4.7 Add Ziggy route generation to `vite.config.ts`
- [ ] 4.8 Verify `@vitejs/plugin-react` is configured in `vite.config.ts`

## 5. Database Setup

- [ ] 5.1 Run `php artisan migrate` to create base tables (users, sessions, cache, jobs, password_resets)
- [ ] 5.2 Verify `users` table exists in database
- [ ] 5.3 Verify `sessions` table exists (for SESSION_DRIVER=database)
- [ ] 5.4 Verify `cache` table exists (for CACHE_STORE=database)
- [ ] 5.5 Verify `jobs` table exists (for QUEUE_CONNECTION=database)
- [ ] 5.6 Configure SQLite for testing: Update `phpunit.xml` to use `:memory:` database

## 6. Configure Development Tooling

- [ ] 6.1 Verify Laravel Pint is installed: `./vendor/bin/pint --version`
- [ ] 6.2 Run Pint to format codebase: `./vendor/bin/pint`
- [ ] 6.3 Configure Concurrently in `composer.json`:
  ```json
  "scripts": {
    "dev": "concurrently \"php artisan serve\" \"php artisan queue:work\" \"php artisan pail\" \"npm run dev\" --names \"server,queue,logs,vite\""
  }
  ```
- [ ] 6.4 Install Concurrently: `npm install --save-dev concurrently`
- [ ] 6.5 Test dev script: `composer dev` (verify all services start)

## 7. Git Configuration

- [ ] 7.1 Verify `.gitignore` includes Laravel defaults (vendor/, node_modules/, .env, etc.)
- [ ] 7.2 Add Treevest-specific ignores if needed (e.g., `storage/exports/` for GDPR exports)
- [ ] 7.3 Create `.editorconfig` for consistent formatting:
  ```ini
  [*]
  charset = utf-8
  indent_style = space
  indent_size = 4
  end_of_line = lf
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.{js,jsx,ts,tsx,json,yml,yaml}]
  indent_size = 2

  [*.md]
  trim_trailing_whitespace = false
  ```

## 8. Verify Authentication Flow

- [ ] 8.1 Start dev server: `php artisan serve`
- [ ] 8.2 Start Vite: `npm run dev`
- [ ] 8.3 Visit `http://localhost:8000` — verify welcome page loads
- [ ] 8.4 Visit `http://localhost:8000/register` — verify Breeze registration page (React + Inertia)
- [ ] 8.5 Register a test user — verify success redirect to dashboard
- [ ] 8.6 Logout and login — verify login flow works
- [ ] 8.7 Test password reset flow — verify email sent (use Mailtrap or log driver)

## 9. Testing Setup

- [ ] 9.1 Run `php artisan test` — verify all Breeze tests pass
- [ ] 9.2 Verify PHPUnit configuration in `phpunit.xml`
- [ ] 9.3 Verify test database uses SQLite in-memory (`:memory:`)
- [ ] 9.4 Write a simple smoke test to verify app boots correctly:
  ```php
  test('application returns successful response', function () {
      $response = $this->get('/');
      $response->assertStatus(200);
  });
  ```
- [ ] 9.5 Run `./vendor/bin/pint` — verify code style passes

## 10. Ziggy Route Configuration

- [ ] 10.1 Verify Ziggy is installed: `composer show tightenco/ziggy`
- [ ] 10.2 Add Ziggy `@routes` directive to `resources/views/app.blade.php`
- [ ] 10.3 Test Ziggy in React component:
  ```typescript
  import { route } from 'ziggy-js';
  console.log(route('dashboard'));
  ```
- [ ] 10.4 Verify Ziggy routes are accessible in TypeScript without errors

## 11. Documentation Updates

- [ ] 11.1 Update `README.md` with installation instructions:
  - Prerequisites (PHP 8.2+, Composer, Node.js 18+, MySQL 8+)
  - Installation steps (composer install, npm install, .env setup, migrations)
  - Running dev server (`composer dev`)
  - Running tests (`php artisan test`)
- [ ] 11.2 Create `docs/development.md` with development workflow:
  - Local development setup (Laragon)
  - Database configuration
  - Testing strategy
  - Code style enforcement (Pint)
- [ ] 11.3 Update `prompter/project.md` with coding conventions:
  - File naming conventions
  - Controller patterns (Inertia::render)
  - Service layer patterns
  - Error handling standards

## 12. Sanity Checks

- [ ] 12.1 Verify `composer.json` has all dependencies from AGENTS.md tech stack
- [ ] 12.2 Verify `package.json` has all frontend dependencies from AGENTS.md
- [ ] 12.3 Verify `config/session.php` uses database driver
- [ ] 12.4 Verify `config/cache.php` uses database driver
- [ ] 12.5 Verify `config/queue.php` uses database driver
- [ ] 12.6 Verify `vite.config.ts` includes Laravel plugin and React plugin
- [ ] 12.7 Verify `tailwind.config.js` includes forms plugin

## Post-Implementation

- [ ] Update AGENTS.md Section 4 (Folder Structure) with actual directory structure
- [ ] Update AGENTS.md Section 21 (Source-of-Truth Matrix) — mark `application-foundation` spec as ✅ Available
- [ ] Create initial commit with message: "feat: scaffold Laravel 12 application with Breeze + Inertia + React"
- [ ] Tag commit as `v0.1.0-scaffold` for reference

## Dependencies

- **Prerequisite**: None (this is the foundational change)
- **Blocks**: `add-security-compliance-infrastructure`, all feature EPICs

## Validation Checklist

- [ ] Run `prompter validate add-laravel-application-scaffold --strict --no-interactive` (must pass)
- [ ] Run `composer install` (completes without errors)
- [ ] Run `npm install` (completes without errors)
- [ ] Run `php artisan test` (all tests pass)
- [ ] Run `./vendor/bin/pint` (no style violations)
- [ ] Run `composer dev` (all services start successfully)
- [ ] Visit `http://localhost:8000` (Laravel welcome page loads)
- [ ] Visit `http://localhost:8000/login` (Breeze login page loads via Inertia + React)
- [ ] Register a test user (end-to-end flow succeeds)
- [ ] Verify Ziggy routes work in browser console: `route('dashboard')`
