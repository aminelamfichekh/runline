# RUNLINE - Complete Testing Guide

## Pre-requisites

### 1. Get Your Current IPv4 Address
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep "inet "
```
Update this IP in `emrun-frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api
```

### 2. Database Setup
```bash
# Rename database from emrun to runline
cd emrun-backend

# Create new database (MySQL)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS runline;"

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed --class=DemoSeeder
```

### 3. Clear Caches
```bash
cd emrun-backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## Quick Start Testing

### Start Backend
```bash
cd emrun-backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Start Queue Worker (in separate terminal)
```bash
cd emrun-backend
php artisan queue:work
```

### Start Frontend
```bash
cd emrun-frontend
npx expo start
```

---

## Test Accounts

### Demo Account (Pre-created)
- **Email:** demo@runline.app
- **Password:** demo123
- **Features:** Complete profile, active subscription, training plan

### Create New Account
Register through the app with any email/password.

---

## Testing Checklist

### 1. Authentication Flow
- [ ] Open app → Splash screen appears
- [ ] Register new account → Success, redirects to questionnaire
- [ ] Login with demo@runline.app / demo123 → Success
- [ ] Logout → Returns to login screen
- [ ] Token refresh works (stay logged in after 1+ hour)

### 2. Questionnaire Flow
- [ ] Step 1: Name/Birth/Gender form works
- [ ] Step 2: Height/Weight wheels work
- [ ] Step 3: Goal selection works
- [ ] Step 3a/3b: Race details (if applicable)
- [ ] Step 4-9: All steps complete without errors
- [ ] Final step saves and redirects to subscription

### 3. Subscription/Payment Flow (Stripe Test Mode)

#### Test Card Numbers:
| Card | Number | Result |
|------|--------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Card declined |
| Auth Required | 4000 0025 0000 3155 | 3D Secure required |

Use any:
- Expiry: Any future date (e.g., 12/28)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

- [ ] Subscription page shows pricing
- [ ] Payment sheet opens
- [ ] Test card 4242... succeeds
- [ ] Redirects to home after payment
- [ ] Subscription status shows "active"

### 4. Plan Generation
- [ ] After subscription, plan generates (may take 30-60 seconds)
- [ ] Plans tab shows weeks with sessions
- [ ] Week details show daily workouts
- [ ] Session types colored correctly (repos=gray, footing=green, etc.)

### 5. UI/UX Quality
- [ ] Page transitions are smooth (no lag)
- [ ] Pull-to-refresh works on plans
- [ ] Bottom navigation works
- [ ] Dark theme consistent throughout
- [ ] RUNLINE branding appears correctly
- [ ] French text displays properly

---

## Testing Stripe Webhooks Locally

### Using Stripe CLI
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Copy the webhook secret (whsec_...) to .env
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Trigger Test Events
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

---

## Testing Plan Generation

### With OpenAI (Real AI)
1. Add your OpenAI key to `.env`:
   ```
   OPENAI_API_KEY=sk-your-real-key
   ```
2. Run:
   ```bash
   php artisan test:plan-generation --sync
   ```

### Without OpenAI (Mock Data)
```bash
php artisan test:plan-generation --skip-openai
```

### View Generated Plan
```bash
# In MySQL
SELECT * FROM plans ORDER BY id DESC LIMIT 1;
```

---

## Common Issues

### "Network Error" or Connection Refused
1. Check your IPv4 address is correct in frontend `.env`
2. Make sure backend is running with `--host=0.0.0.0`
3. Check firewall isn't blocking port 8000

### "Subscription Required" Error
Add to backend `.env`:
```
BYPASS_SUBSCRIPTION=true
```
Then: `php artisan config:clear`

### Plan Generation Stuck on "Generating"
1. Check queue worker is running: `php artisan queue:work`
2. Check OpenAI key is valid
3. View logs: `tail -f storage/logs/laravel.log`

### Database "Table not found"
```bash
php artisan migrate
```

---

## Production Build

### Android APK
```bash
cd emrun-frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK for testing
eas build -p android --profile preview
```

### iOS (requires Mac + Apple Developer Account)
```bash
eas build -p ios --profile preview
```

---

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/auth/register | POST | No | Create account |
| /api/auth/login | POST | No | Login |
| /api/auth/me | GET | Yes | Get current user |
| /api/profile | GET/PUT | Yes | User profile |
| /api/plans | GET | Yes | All user plans |
| /api/plans/active | GET | Yes | Current active plan |
| /api/subscription/status | GET | Yes | Subscription status |
| /api/payment/create-subscription | POST | Yes | Start Stripe payment |

---

## Contact

If you encounter issues not covered here, check:
1. Backend logs: `storage/logs/laravel.log`
2. Frontend console: Metro bundler output
3. Network tab in React Native Debugger
