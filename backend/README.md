# Sentinel AI Backend - Setup Instructions

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL (via Docker or local installation)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_ACCESS_SECRET** & **JWT_REFRESH_SECRET**: Generate using `openssl rand -base64 32`
- **RESEND_API_KEY**: Get from https://resend.com/api-keys
- **FRONTEND_URL**: Your frontend URL (default: http://localhost:3000)
- **CSRF_SECRET** & **COOKIE_SECRET**: Generate random strings

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- pgAdmin on port 5050 (optional database management UI)

### 4. Push Database Schema

```bash
npm run db:push
```

This creates all the tables in your database.

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| GET | `/auth/verify-email?token=xxx` | Verify email | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh` | Refresh access token | Yes (refresh token) |
| POST | `/auth/logout` | Logout | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |
| POST | `/auth/change-password` | Change password | Yes |
| GET | `/auth/me` | Get current user | Yes |

## Database Management

### Generate Migrations

```bash
npm run db:generate
```

### Push Schema Changes

```bash
npm run db:push
```

### Open Drizzle Studio

```bash
npm run db:studio
```

## Email Configuration (Resend)

1. Sign up at https://resend.com
2. Create an API key
3. Add domain or use test domain
4. Add API key to `.env` as `RESEND_API_KEY`

## Security Features

✅ **Helmet.js** - HTTP security headers
✅ **CORS** - Configured for frontend communication  
✅ **Rate Limiting** - 10 requests per minute per IP
✅ **CSRF Protection** - Cookie-based tokens
✅ **JWT Authentication** - Access & refresh tokens
✅ **Password Hashing** - bcrypt with 12 rounds
✅ **Email Verification** - Required before login
✅ **Session Tracking** - Unusual login detection

## Development

```bash
# Start in development mode
npm run start:dev

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Troubleshooting

### Database Connection Issues

Make sure PostgreSQL is running:
```bash
docker-compose ps
```

### Email Not Sending

Check `RESEND_API_KEY` in `.env` is correct and domain is verified.

### JWT Errors

Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set and different.

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── dto/        # Data transfer objects
│   │   ├── guards/     # Auth guards
│   │   ├── strategies/ # Passport strategies
│   │   └── decorators/ # Custom decorators
│   ├── database/       # Database module
│   │   └── schema.ts   # Drizzle schema
│   ├── email/          # Email service
│   │   └── templates/  # Email templates
│   └── sessions/       # Session tracking
├── drizzle/            # Database migrations (auto-generated)
├── docker-compose.yml  # PostgreSQL container
└── drizzle.config.ts   # Drizzle ORM config
```
