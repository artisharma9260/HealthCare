# HealthCare Manager

A patient/doctor/admin appointment management app.

- **Frontend**: `HealthCareManager-main/` — React + Vite + TypeScript + Tailwind
- **Backend**: `backend/` — Node.js + Express + MongoDB (Mongoose), JWT authentication

The frontend no longer talks to Supabase. All data (auth, doctors, appointments, AI
summaries) is served by the Express API in `backend/`.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/healthcare_manager   # or an Atlas URI
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=                                              # optional, enables AI summaries
```

You need a running MongoDB instance — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

Seed demo accounts (patient/doctor/admin, all password `password123`) and a demo
doctor profile:

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # auto-restarts on file changes (Node's --watch)
# or
npm start
```

The API listens on `http://localhost:5000` by default. Health check:
`GET http://localhost:5000/api/health`.

## 2. Frontend setup

```bash
cd HealthCareManager-main
npm install
```

`.env` already points at the local backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign in with one of the seeded demo accounts, or
register a new patient account (registration is now a single email + password
step — no OTP).

## API overview

| Method | Path                                          | Auth           | Description                          |
|--------|------------------------------------------------|----------------|---------------------------------------|
| POST   | /api/auth/register                              | –              | Create a patient account              |
| POST   | /api/auth/login                                 | –              | Log in, returns JWT                   |
| GET    | /api/auth/me                                    | Bearer token   | Current user                          |
| GET    | /api/doctors                                    | –              | List active doctors                   |
| GET    | /api/doctors/:id                                | –              | Doctor by id                          |
| POST   | /api/doctors                                    | admin          | Create doctor                         |
| PATCH  | /api/doctors/:id                                | admin          | Update doctor                         |
| DELETE | /api/doctors/:id                                | admin          | Deactivate doctor                     |
| GET    | /api/appointments                               | admin          | All appointments                      |
| GET    | /api/appointments/patient/:patientId            | user           | A patient's appointments              |
| GET    | /api/appointments/doctor/:doctorId              | user           | A doctor's appointments               |
| GET    | /api/appointments/slots/:doctorId/:date         | user           | Generated time slots for a day        |
| POST   | /api/appointments/slot-holds                    | user           | Temporarily hold a slot (5 min TTL)   |
| POST   | /api/appointments/confirm                       | user           | Confirm a booking                     |
| PATCH  | /api/appointments/:id/cancel                    | user           | Cancel a booking                      |
| POST   | /api/ai/pre-visit-summary                       | user           | Gemini-powered triage summary         |
| POST   | /api/ai/post-visit-summary                      | user           | Gemini-powered patient summary        |

All authenticated routes expect `Authorization: Bearer <token>`, where `<token>`
is the JWT returned from `/api/auth/login` or `/api/auth/register` (the frontend
stores this in `localStorage` automatically).
