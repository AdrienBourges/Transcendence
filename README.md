# Transcendence

## Current Status

### Frontend

- Register page working: `http://localhost:5173/register`
- Login page working: `http://localhost:5173/login`
- Logout flow working

### Backend

- Email/password registration
- Email/password login
- 42 OAuth login
- JWT authentication
- Get current authenticated user
- Get public user profile by ID
- Update current user profile
- Avatar image upload to filesystem

---

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT + 42 OAuth
- **File Storage:** Backend filesystem
- **Realtime / Chat:** planned
- **HTTPS / Reverse Proxy:** planned
- **Full Dockerization:** planned

---

## Prerequisites

Make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Transcendence
```

### 2. Create the backend environment file

```bash
cp backend/.env.example backend/.env
```

### 3. Start PostgreSQL

```bash
docker-compose up -d postgres
```

Check that it is running:

```bash
docker-compose ps
```

### 4. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:3000`

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Frontend Routes

Currently available:

- **Register:** `http://localhost:5173/register`
- **Login:** `http://localhost:5173/login`

---

## 42 OAuth Login

To test 42 OAuth, open this URL in your browser:

```text
https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-9ac612b679f1a8dccfab14517f2f446d97dd25e3b80380cb97ddbbe64b321423&redirect_uri=http://localhost:3000/api/auth/callback&response_type=code
```

It will redirect to the backend callback:

`http://localhost:3000/api/auth/callback`

---

## API Endpoints

### Authentication

#### `POST /api/auth/register`
Create a new user with:
- `email`
- `username`
- `password`

#### `POST /api/auth/login`
Authenticate a user with email/password.

Returns:
- a **JWT**
- user data

### Users

#### `GET /api/users/me` *(JWT required)*
Get the current authenticated user.

#### `GET /api/users/:id`
Get a public user profile by ID.

#### `PATCH /api/users/me` *(JWT required)*
Update the current user's profile.

Example fields:
- `avatarUrl`
- `languages`
- `discord`
- `pronouns`

### Upload

#### `POST /api/upload/avatar` *(JWT required)*
Upload an avatar image.

The file is saved in the backend filesystem.

### Health

#### `GET /api/health`
Check if the server is running.

#### `GET /api/db-health`
Check database connection.

---

## API Test Commands
### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"gwendal","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Get current authenticated user

Replace `TOKEN` with the JWT returned by login.

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

### Get public user profile by ID

```bash
curl http://localhost:3000/api/users/1
```

### Update current user's profile

Replace `TOKEN` with the JWT returned by login.

```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"avatarUrl":"https://example.com/avatar.png","languages":"fr,en","discord":"gholloco","pronouns":"he/him"}'
```

### Health check

```bash
curl http://localhost:3000/api/health
```

### Database health check

```bash
curl http://localhost:3000/api/db/health
```

### Upload avatar

Replace `TOKEN` with the JWT returned by login, and replace the file path with a real image path on your machine.

```bash
curl -X POST http://localhost:3000/api/upload/avatar/ \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@/home/gwendal/avatar.png"
```

---

## Notes

- Frontend and backend currently run locally
- HTTPS is not set up yet
- PostgreSQL runs in Docker while the apps run on the host
- Full Dockerization and nginx reverse proxy are planned
- Groups, friends, search, and real-time chat are the next priorities

---


