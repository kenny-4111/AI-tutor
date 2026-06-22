AI Tutor

[![Repository](https://img.shields.io/badge/Repo-GitHub-181717?logo=github)](https://github.com/kenny-4111/AI-tutor)

AI Tutor is a real-time, hands-free tutoring application that listens to learners, answers questions, and responds with lifelike speech and video guidance. It combines conversational AI, text-to-speech, and generative presenter video to create an interactive learning experience.

## Key Features

- Real-time chat assistant (Hugging Face / OpenAI-compatible chat models)
- Text-to-speech via ElevenLabs for natural spoken responses
- Lifelike presenter videos via D-ID (optional) for cinematic guidance
- Google + email sign-in (NextAuth) with demo credentials support
- Usage/subscription tracking UI and dashboard

## Architecture Overview

- Frontend: Next.js (App Router) + React
- Auth: NextAuth (Google provider + credentials demo)
- Chat: routed through Hugging Face using the OpenAI-compatible client
- TTS: ElevenLabs API (audio/mpeg streamed from `/api/tts`)
- Presenter video: D-ID API (`/api/did/talk`)

## Required environment variables

Create a `.env.local` file (do NOT commit real secrets). See `.env.local.example` for placeholders. The app expects the following variables:

- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DEMO_USER_EMAIL` (optional for demo credentials)
- `DEMO_USER_PASSWORD` (optional for demo credentials)
- `HF_API_KEY` (Hugging Face / model router)
- `ELEVENLABS_API_KEY` (ElevenLabs TTS)
- `DID_API_KEY` (D-ID API key)
- `DID_PRESENTER_ID` (D-ID presenter ID)

Important: If any of these keys are committed to the repository, remove them and rotate the secrets immediately.

## Quickstart (development)

Install dependencies and run locally:

```bash
npm install
# copy example env (UNIX/macOS)
cp .env.local.example .env.local
# on Windows (PowerShell)
copy .env.local.example .env.local
# Edit .env.local and paste your keys, then run:
npm run dev
```

Open http://localhost:3000 to try the app.

## Backend endpoints (selected)

- `POST /api/chat` — send `{ prompt }`, returns `{ text }` from the chat model.
- `POST /api/tts` — send `{ text }`, returns `audio/mpeg` stream from ElevenLabs.
- `POST /api/did/talk` — send `{ text }`, returns `{ videoUrl }` after generating a presenter video.

## Security note

This repository previously contained an `.env.local` file in the working tree. If any API keys were committed, consider them compromised and rotate them. Ensure `.env*` is listed in `.gitignore` and avoid committing secrets.

## Contributing

- Open issues or PRs in the repository. For major changes, open an issue first to discuss.

---

Repository: https://github.com/kenny-4111/AI-tutor
