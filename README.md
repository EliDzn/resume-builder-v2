# Resume Builder v2

A local-first resume builder with a live PDF preview, resume import, and optional AI-powered resume insights.

## Features

- Edit resume details in your browser.
- Persist resume data in browser storage.
- Import selectable-text PDF and DOCX files up to 20 MB.
- Preview and download your resume as a PDF.
- Request AI insights based on resume details and a job description.
- Limit AI usage to five successful generations per IP per day.
- Cache identical AI requests for 10 minutes.
- Allow one in-flight AI request per IP.
- Fail closed when Redis protection is unavailable.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- React PDF
- Upstash Redis
- Google Gemini API
