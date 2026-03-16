# Transcendence


## Project status

At the current stage, the following already works:

- React frontend launches
- Express backend launches
- backend test route works
- frontend can call the backend successfully
- PostgreSQL runs in Docker
- backend can connect to PostgreSQL
- backend `.env.example` is available

---

## Tech stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL
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

## Run the backend

Open a terminal and run:

```bash
cd backend
npm install
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

## Test the database connection

With the backend still running, open:

`http://localhost:3000/api/db-health`

Or test it in the terminal:

```bash
curl http://localhost:3000/api/db-health
```

Expected result:

A JSON response confirming that the database connection works.

The response should include:

- a success message
- the database name
- the current timestamp

Example:

```json
{
  "message": "Database connection OK",
  "database": "transcendence",
  "now": "2026-03-16T..."
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
- `/api/health` returning success
- `/api/db-health` returning success
- frontend displaying the backend message

---

## Notes

- frontend and backend currently run locally
- PostgreSQL currently runs in Docker
- nginx / HTTPS setup will be added later in the project
- full Dockerization of the whole app will be added later in the project

