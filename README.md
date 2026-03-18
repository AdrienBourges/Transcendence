# Transcendence


## Project status

At the current stage, the following already works:

- React frontend launches
- Express backend launches
- backend test route works
- frontend can call the backend successfully
- PostgreSQL runs in Docker
- Prisma is configured in the backend
- Backend can connect to PostgreSQL through Prisma
- backend `.env.example` is available

---

## Tech stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Realtime:** Socket.IO *(planned later)*
- **Reverse proxy / HTTPS:** nginx *(planned later)*
- **Containerization:** Docker

---


## Prerequisites

Make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

---

## Getting started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Transcendence
```

### 2. Create the backend environment file

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

### 3. Start PostgreSQL

From the project root, run:

```bash
docker-compose up -d postgres
```

To check that the container is running:

```bash
docker-compose ps
```

You should see the `postgres` service running.

---
### 4. Install backend dependencies

Open a terminal and run:

```bash
cd backend
npm install
```

### 5. Apply Prisma migrations
Still inside backend/, run

```bash
npx prisma migrate dev
```

This will:

connect Prisma to PostgreSQL

- apply the existing database migrations

- generate the Prisma client

### 6. Run the backend

Still inside backend/, run:

```bash
npm run dev
```
The backend should start on:

`http://localhost:3000`

---

## Test the backend

### Health route

Open this URL in your browser:

`http://localhost:3000/api/health`

Or test it in the terminal:

```bash
curl http://localhost:3000/api/health
```

Expected result:

```json
{"message":"Backend is running"}
```

---

## Test the database connection through prisma

With the backend still running, open:

`http://localhost:3000/api/db-health`

Or test it in the terminal:

```bash
curl http://localhost:3000/api/db-health
```

Expected result:

A JSON response confirming that the backend can talk to Postgresql through Prisma.

The response should include be a success message

```json
{
  "message": "Database connection OK"
}
```

---

## Run the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend should start on:

`http://localhost:5173`

---

## Test the frontend → backend connection

Open the frontend in your browser:

`http://localhost:5173`

Expected result:

- the page loads correctly
- you should see a message from the backend displayed on the page

For example:

`Backend message: Backend is running`

This confirms that:

- the frontend is running
- the backend is running
- the frontend can call the backend successfully

---

## Current working setup

If everything is working correctly, you should have:

- PostgreSQL running in Docker
- backend running on `localhost:3000`
- frontend running on `localhost:5173`
- Prisma migrations applied successfully
- `/api/health` returning success
- `/api/db-health` returning success
- frontend displaying the backend message

---

## Notes

- frontend and backend currently run locally
- PostgreSQL currently runs in Docker
- Prisma is used as the backend ORM
- nginx / HTTPS setup will be added later in the project
- full Dockerization of the whole app will be added later in the project

