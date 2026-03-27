# Transcendence

A social web application project developed for **42 students**.

## Current Status

### Frontend

- Register page working: `http://localhost:5173/register`
- Login page working: `http://localhost:5173/login`
- Logout flow working
- 42 OAuth login working from the frontend login flow
- Profile update
- Avatar update
- Accesss someone's profile: http://localhost:5173/profile/:userid. (example: http://localhost:5173/profile/1)

### Backend

- Email/password registration
- Email/password login
- 42 OAuth login
- JWT authentication
- Get current authenticated user
- Get public user profile by ID
- Update current user profile
- Avatar image upload to filesystem
- Friendship feature:
  - add a friend
  - remove a friend
  - get the current user's friend list

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

42 OAuth can now be started directly from the frontend login page.

### Frontend flow

- open the frontend login page: `http://localhost:5173/login`
- click **Login with 42**
- the frontend redirects to the backend OAuth route
- after authentication on the 42 side, the user is redirected back through the backend callback flow

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

#### `GET /api/users/me/friends` *(JWT required)*
Get the current user's friend list.

#### `PATCH /api/users/me` *(JWT required)*
Update the current user's profile.

Example fields:
- `avatarUrl`
- `languages`
- `discord`
- `pronouns`

### Friends

#### `POST /api/friends/:id` *(JWT required)*
Add user `:id` to the current user's friend list.

#### `DELETE /api/friends/:id` *(JWT required)*
Remove user `:id` from the current user's friend list.

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

### Get current user's friend list

Replace `TOKEN` with the JWT returned by login.

```bash
curl http://localhost:3000/api/users/me/friends \
  -H "Authorization: Bearer TOKEN"
```

### Add a friend

Replace `TOKEN` with the JWT returned by login.

```bash
curl -X POST http://localhost:3000/api/friends/2 \
  -H "Authorization: Bearer TOKEN"
```

### Remove a friend

Replace `TOKEN` with the JWT returned by login.

```bash
curl -X DELETE http://localhost:3000/api/friends/2 \
  -H "Authorization: Bearer TOKEN"
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
curl http://localhost:3000/api/db-health
```

### Upload avatar

Replace `TOKEN` with the JWT returned by login, and replace the file path with a real image path on your machine.

```bash
curl -X POST http://localhost:3000/api/upload/avatar/ \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@/home/gwendal/avatar.png"
```

---

## Friendship Feature Notes

The friendship system is **unilateral**:

- adding a user to your friend list does **not** require acceptance
- adding a user does **not** automatically add you to their friend list
- each user manages their own friend list independently

---

## Notes

- Frontend and backend currently run locally
- HTTPS is not set up yet
- PostgreSQL runs in Docker while the apps run on the host
- Full Dockerization and nginx reverse proxy are planned
- Groups, search, and real-time chat are next priorities

---
