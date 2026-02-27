# Treevest

**Treevest** is a digital investment platform that allows users to invest in individual fruit trees rather than traditional stocks or shares. Returns are generated based on actual agricultural harvest cycles.

## About Treevest

Treevest operates similarly to a stock exchange but for agricultural investments. Users can browse farms, select specific fruit trees to invest in, and earn returns based on real harvest yields and market prices.

**Key Features:**
- Individual fruit tree investments with transparent ROI projections
- Real-time portfolio tracking and tree health monitoring
- Harvest cycle management with scheduled returns
- Multi-currency support and flexible payout options
- KYC verification and secure payment processing
- Farm discovery with geospatial mapping
- Investment education and crop encyclopedia

## Tech Stack

- **Backend:** Laravel 12.x (PHP 8.2+)
- **Frontend:** React 18.x + TypeScript 5.x via Inertia.js 2.x
- **Authentication:** Laravel Breeze with React
- **Styling:** Tailwind CSS 3.x
- **Build Tool:** Vite 7.x
- **Database:** MySQL 8.x (production), SQLite (testing)
- **Testing:** PHPUnit 11.x
- **Code Style:** Laravel Pint 1.x

## Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js and npm
- MySQL 8.x
- Laragon (recommended for local development)

### Installation

1. Clone the repository
2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install Node dependencies:
   ```bash
   npm install
   ```

4. Copy environment file:
   ```bash
   cp .env.example .env
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Start MySQL in Laragon and create database:
   ```sql
   CREATE DATABASE treevest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

7. Run migrations:
   ```bash
   php artisan migrate
   ```

8. Build frontend assets:
   ```bash
   npm run build
   ```

### Development

Start the development environment with all services:
```bash
composer dev
```

This runs:
- Laravel development server (port 8000)
- Queue worker
- Log viewer (Pail)
- Vite dev server (HMR)

Or run services individually:
```bash
php artisan serve
npm run dev
```

### Testing

Run the test suite:
```bash
composer test
```

Or directly with PHPUnit:
```bash
php artisan test
```

### Code Style

Format code with Laravel Pint:
```bash
./vendor/bin/pint
```

## Project Structure

- `app/` - Laravel application code
- `resources/js/Pages/` - Inertia page components (React/TSX)
- `resources/js/Components/` - Shared React components
- `database/migrations/` - Database schema migrations
- `routes/web.php` - Web routes (Inertia)
- `prompter/` - Spec-driven development documentation

## Documentation

See `prompter/` directory for detailed project documentation:
- `prompter/prd.md` - Product Requirements Document
- `prompter/AGENTS.md` - Development workflow and conventions
- `AGENTS.md` - Project knowledge base

## License

Proprietary - All rights reserved.
