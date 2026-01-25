# Technology Stack

**Analysis Date:** 2026-01-24

## Languages

**Primary:**
- PHP 8.2+ - Backend API (Laravel framework)
- JavaScript/Node.js - Frontend build tooling and mobile app
- TypeScript 5.1.3 - Mobile app (via Expo)

**Secondary:**
- HTML/CSS - Web interface (via Tailwind CSS)

## Runtime

**Environment:**
- PHP 8.2+ with Laravel 12.0
- Node.js (via npm)
- Expo 54.0.0 - Mobile cross-platform runtime (iOS, Android, Web)

**Package Manager:**
- Composer (PHP) - Version managed via composer.json in `emrun-backend/`
- npm - Version managed via package.json in `emrun-frontend/` and `emrun-frontend/` (mobile)
- Lockfile: Yes (composer.lock and package-lock.json present)

## Frameworks

**Core:**
- Laravel 12.0 - Backend REST API framework
- Expo Router 6.0.21 - Mobile navigation and routing
- React Native 0.81.5 - Mobile UI framework
- React 19.1.0 - Web and mobile UI components
- React DOM 19.2.3 - Web rendering

**Build/Dev:**
- Vite 7.0.7 - Frontend asset bundler and dev server
- Tailwind CSS 4.0.0 - Utility-first CSS framework
- @tailwindcss/vite 4.0.0 - Vite integration for Tailwind
- laravel-vite-plugin 2.0.0 - Laravel integration with Vite
- Babel 7.20.0 - JavaScript transpiler
- babel-plugin-module-resolver 5.0.2 - Alias path resolution

**Testing:**
- PHPUnit 11.5.3 - PHP unit testing
- Mockery 1.6 - Mock object library for PHP

## Key Dependencies

**Critical:**
- openai-php/client 0.18.0 - OpenAI API client for generating training plans
- stripe/stripe-php 19.1 - Stripe payment processing SDK
- tymon/jwt-auth 2.2 - JWT authentication for API
- predis/predis 3.3 - Redis PHP client for caching and sessions

**Infrastructure:**
- axios 1.6.5+ - HTTP client for frontend API calls
- @react-native-async-storage/async-storage 2.2.0 - Local persistent storage for mobile
- @react-native-community/datetimepicker 8.4.4 - Native date/time picker
- react-hook-form 7.49.3 - Form state management
- @hookform/resolvers 3.3.4 - Form validation resolvers
- zod 3.22.4 - TypeScript-first schema validation
- date-fns 3.0.6 - Date utility library
- expo-constants 18.0.13 - Expo app constants
- expo-linking 8.0.11 - Deep linking support
- react-native-safe-area-context 5.6.0 - Safe area support for notches
- react-native-screens 4.16.0 - Native screen components
- react-native-web 0.21.2 - React Native web renderer

**Development Only:**
- laravel/pint 1.24 - Laravel code style formatter
- laravel/pail 1.2.2 - Log file viewer
- laravel/sail 1.41 - Docker development environment
- concurrently 9.0.1 - Run multiple commands concurrently
- nunomaduro/collision 8.6 - Error handler
- fakerphp/faker 1.23 - Fake data generation
- @types/react 19.1.10 - TypeScript types for React

## Configuration

**Environment:**
- Configuration via environment variables in `.env` files
- Backend: `/c/Users/dell/running/emrun-backend/.env.example`
- Frontend: `/c/Users/dell/running/emrun-frontend/.env`
- Mobile app uses Expo's environment variable system (EXPO_PUBLIC_* variables)

**Build:**
- Backend Vite config: `emrun-backend/vite.config.js` - Handles CSS and JS bundling
- Mobile/Frontend: Standard Expo config via `app.config.js`
- TypeScript: `emrun-frontend/babel.config.js` for transpilation

**Key Environment Variables:**
- `APP_NAME`, `APP_ENV`, `APP_DEBUG`, `APP_URL` - General app config
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` - Database
- `OPENAI_API_KEY`, `OPENAI_ORGANIZATION` - OpenAI API
- `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `FIREBASE_SERVER_KEY` - Firebase Cloud Messaging for push notifications
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis caching
- `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT` - Mail configuration
- `QUEUE_CONNECTION` - Queue driver (defaults to database)
- `EXPO_PUBLIC_API_URL` - Mobile app API endpoint

## Platform Requirements

**Development:**
- PHP 8.2+ with extensions: PDO, Composer
- Node.js with npm
- Expo CLI (for mobile development)
- SQLite (default for development)
- Optional: Redis, MySQL, PostgreSQL for production configurations

**Production:**
- PHP 8.2+ application server
- Database: SQLite (dev), MySQL/MariaDB/PostgreSQL (production)
- Optional: Redis for caching and sessions
- Queue processing: Database driver or Redis/SQS
- Firebase account for push notifications
- Stripe account for payments
- OpenAI account for plan generation

---

*Stack analysis: 2026-01-24*
