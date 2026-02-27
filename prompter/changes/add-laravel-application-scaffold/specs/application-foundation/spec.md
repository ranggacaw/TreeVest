# Capability: Application Foundation

## ADDED Requirements

### Requirement: Laravel Framework Installation

The system SHALL be built on Laravel 12.x framework with PHP 8.2 or higher.

#### Scenario: Framework version verification
- **WHEN** developer runs `php artisan --version`
- **THEN** the system displays Laravel Framework version 12.x

#### Scenario: Composer dependencies installed
- **WHEN** developer runs `composer install`
- **THEN** all dependencies install successfully without errors
- **AND** `vendor/` directory contains Laravel framework files

### Requirement: Database Configuration

The system SHALL use database driver for sessions, cache, and queues as specified in AGENTS.md Section 2 (Tech Stack).

#### Scenario: Session driver configured
- **WHEN** application configuration is loaded
- **THEN** `config('session.driver')` returns `database`
- **AND** `sessions` table exists in the database

#### Scenario: Cache driver configured
- **WHEN** application configuration is loaded
- **THEN** `config('cache.default')` returns `database`
- **AND** `cache` table exists in the database

#### Scenario: Queue driver configured
- **WHEN** application configuration is loaded
- **THEN** `config('queue.default')` returns `database`
- **AND** `jobs` table exists in the database

### Requirement: Authentication Scaffold

The system SHALL provide authentication functionality via Laravel Breeze with React + TypeScript stack.

#### Scenario: Breeze installation verified
- **WHEN** developer inspects `routes/auth.php`
- **THEN** authentication routes exist (login, register, password-reset, logout)

#### Scenario: React authentication pages exist
- **WHEN** developer inspects `resources/js/Pages/Auth/`
- **THEN** TypeScript React components exist for Login, Register, ForgotPassword, ResetPassword

#### Scenario: User registration flow
- **WHEN** user visits `/register` and submits valid registration data
- **THEN** a new user record is created in the `users` table
- **AND** user is redirected to `/dashboard`
- **AND** user session is established

#### Scenario: User login flow
- **WHEN** user visits `/login` and submits valid credentials
- **THEN** user is authenticated successfully
- **AND** user is redirected to `/dashboard`
- **AND** user session is established

### Requirement: Inertia.js SSR Bridge

The system SHALL use Inertia.js 2.x to bridge server-side Laravel routing with client-side React rendering.

#### Scenario: Inertia installed and configured
- **WHEN** developer inspects `package.json`
- **THEN** `@inertiajs/react` version 2.x is listed as a dependency

#### Scenario: Inertia middleware registered
- **WHEN** developer inspects `app/Http/Kernel.php`
- **THEN** `HandleInertiaRequests` middleware is registered in the web middleware group

#### Scenario: Inertia response rendering
- **WHEN** controller returns `Inertia::render('PageName', ['prop' => 'value'])`
- **THEN** the React component `resources/js/Pages/PageName.tsx` is rendered
- **AND** props are available in the React component

### Requirement: Frontend Asset Pipeline

The system SHALL use Vite 7.x with Laravel Vite plugin for asset compilation and hot module replacement.

#### Scenario: Vite configuration exists
- **WHEN** developer inspects `vite.config.ts`
- **THEN** `laravel-vite-plugin` is configured
- **AND** `@vitejs/plugin-react` is configured

#### Scenario: Development server starts
- **WHEN** developer runs `npm run dev`
- **THEN** Vite development server starts successfully
- **AND** hot module replacement is active

#### Scenario: Production build
- **WHEN** developer runs `npm run build`
- **THEN** optimized assets are generated in `public/build/`
- **AND** manifest file is created for asset versioning

### Requirement: Tailwind CSS Styling

The system SHALL use Tailwind CSS 3.x with the forms plugin for styling.

#### Scenario: Tailwind configuration exists
- **WHEN** developer inspects `tailwind.config.js`
- **THEN** configuration includes `@tailwindcss/forms` plugin
- **AND** content paths include `resources/js/**/*.tsx`

#### Scenario: Tailwind styles applied
- **WHEN** React component uses Tailwind utility classes (e.g., `className="text-blue-500"`)
- **THEN** styles are applied correctly in the browser

### Requirement: Ziggy Route Helper

The system SHALL provide Laravel named routes to JavaScript/TypeScript via Ziggy 2.x.

#### Scenario: Ziggy installed and configured
- **WHEN** developer inspects `composer.json`
- **THEN** `tightenco/ziggy` version 2.x is listed as a dependency

#### Scenario: Routes accessible in TypeScript
- **WHEN** TypeScript code calls `route('dashboard')`
- **THEN** the function returns the correct URL for the dashboard route
- **AND** no TypeScript errors occur

### Requirement: Code Style Enforcement

The system SHALL enforce Laravel coding standards via Laravel Pint 1.x.

#### Scenario: Pint installed
- **WHEN** developer runs `./vendor/bin/pint --version`
- **THEN** Laravel Pint version 1.x is displayed

#### Scenario: Code style check
- **WHEN** developer runs `./vendor/bin/pint`
- **THEN** all PHP files are formatted according to PSR-12 standards
- **AND** the command exits with status 0

### Requirement: Testing Infrastructure

The system SHALL support PHPUnit 11.x for testing with SQLite in-memory database for test execution.

#### Scenario: PHPUnit configured
- **WHEN** developer inspects `phpunit.xml`
- **THEN** test database is configured to use SQLite `:memory:`
- **AND** test environment variables are set

#### Scenario: Tests execute successfully
- **WHEN** developer runs `php artisan test`
- **THEN** all default Laravel Breeze tests pass
- **AND** test output shows successful execution

### Requirement: Development Workflow

The system SHALL provide a unified development server command via Composer script.

#### Scenario: Concurrent services startup
- **WHEN** developer runs `composer dev`
- **THEN** the following services start concurrently:
  - `php artisan serve` (Laravel development server)
  - `php artisan queue:work` (queue worker)
  - `php artisan pail` (log viewer)
  - `npm run dev` (Vite development server)

#### Scenario: Services run in parallel
- **WHEN** `composer dev` is running
- **THEN** all services output logs to the terminal
- **AND** services can be stopped with a single Ctrl+C

### Requirement: Environment Configuration

The system SHALL provide an `.env.example` file with all required environment variables for Treevest.

#### Scenario: Environment template exists
- **WHEN** developer inspects `.env.example`
- **THEN** all required variables are documented with example values:
  - `APP_NAME=Treevest`
  - `DB_CONNECTION=mysql`
  - `SESSION_DRIVER=database`
  - `CACHE_STORE=database`
  - `QUEUE_CONNECTION=database`

#### Scenario: Environment file copied
- **WHEN** developer copies `.env.example` to `.env`
- **AND** runs `php artisan key:generate`
- **THEN** application can boot successfully with minimal configuration changes
