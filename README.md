# Mira AI Companion

React/Vite frontend for the persistent Mira companion chat. The backend runs at `D:\Appointment booking`.

## Run locally

Requirements: Node.js 20+ and a running PostgreSQL instance.

1. Configure and migrate the backend following `D:\Appointment booking\README.md`. The backend `.env` must contain `DATABASE_URL`, `NVIDIA_API_KEY`, `DEMO_SHARED_PASSWORD`, and `DEMO_SESSION_SECRET`. Add `GEMINI_API_KEY` to enable image generation. Keep all provider keys in the backend only.
2. Start the backend:

   ```powershell
   Set-Location 'D:\Appointment booking'
   npm run dev
   ```

3. Configure and run the frontend:

   ```powershell
   Set-Location 'D:\BooklyAI-Frontend'
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`, log in with a display name and the `DEMO_SHARED_PASSWORD` configured in the backend, then choose Hindi, English, or Hinglish. Ask Mira to send/generate a picture to test the Gemini integration.

Vite proxies `/api` requests to `BACKEND_URL` (defaults to `http://localhost:3030`). The frontend never contains the NVIDIA or Gemini API key.

## Chat and saved content

Profiles, language preferences, conversation messages, and generated fictional Mira images are stored in PostgreSQL. Refreshing or logging out does not delete them. Image retrieval is protected by the same signed HttpOnly session cookie as the chat.

The chatbot is companion-only. Appointment routes and admin dashboard have been removed. See the backend README for the migration warning: it drops appointment/business/service/staff/booking-chat records and tables while preserving companion profiles and conversations.

This shared-password authentication is only a local demo. Identical normalized names share one profile, and anyone with the shared password can access demo accounts. Use real accounts and verified identity before public deployment.

Run `npm run lint` and `npm run build` to validate the frontend.
