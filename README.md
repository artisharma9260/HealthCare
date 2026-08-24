## 🏥 Healthcare Appointment & Follow-up Manager

A full-stack **MERN healthcare appointment platform** that connects patients, doctors, and administrators through separate role-based portals.

### ✨ Features

* 👤 **Patient Portal** — Register, search doctors, view available slots, book/reschedule/cancel appointments, and submit symptoms before visits.
* 👨‍⚕️ **Doctor Portal** — View appointments, access AI-generated symptom summaries, add clinical notes and prescriptions, and generate patient-friendly post-visit summaries.
* 🛠️ **Admin Portal** — Manage doctors, specialisations, working hours, slot duration, and leave days.
* 🤖 **AI Integration** — Gemini generates pre-visit symptom summaries with urgency levels and post-visit summaries.
* 🔒 **Secure Booking** — Temporary slot holds and database-level concurrency handling prevent double bookings.
* 📧 **Email Notifications** — Booking confirmations, reminders, cancellations, rescheduling, and medication reminders.
* 📅 **Google Calendar** — Automatically creates, updates, and removes appointment events.
* ⏰ **Background Jobs** — Handles medication reminders and retries failed notifications.
* 🩺 **Leave Management** — Detects existing appointments when a doctor is marked on leave and notifies affected patients.
* ⚡ **Error Handling** — AI, email, and calendar failures are handled gracefully without breaking appointments.

### 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB, Mongoose
**Authentication:** JWT, bcrypt
**AI:** Google Gemini API
**Email:** Nodemailer
**Calendar:** Google Calendar API, OAuth 2.0
**Background Jobs:** Node-cron

### 🔄 Workflow

```text
Patient
   ↓
Search Doctor
   ↓
Select Available Slot
   ↓
Submit Symptoms
   ↓
Book Appointment
   ↓
AI Pre-Visit Summary
   ↓
Doctor Consultation
   ↓
Notes + Prescription
   ↓
AI Patient-Friendly Summary
   ↓
Medication Reminders + Follow-up
```

### 🔐 Key Engineering Highlights

* Prevents **double booking during simultaneous requests**
* Uses **temporary slot holds**
* Handles **doctor leave conflicts**
* Supports **AI failure fallback and retry**
* Supports **email failure retry**
* Synchronizes appointments with **Google Calendar**
* Implements **role-based authentication and authorization**

