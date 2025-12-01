# NEMSU Campus Guide - Project Summary

## Overview
This project is a modern web application designed as an AI-powered campus assistant for NEMSU. It helps students and staff with instant answers about enrollment, schedules, grades, tuition, campus facilities, and more. The app is built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS for a fast, responsive, and visually appealing experience.

## Features
- **Landing Page**: Welcomes users and provides a search box for questions.
- **Chat Assistant**: Simulated AI chat for campus-related queries, with quick topic shortcuts (Enrollment, Schedules, Grades, Tuition, Campus Map, Registrar).
- **Dashboard**: Quick access to enrollment, schedule, grades, courses, and notifications (deadlines, events, grades).
- **Navigation Bar**: Theme toggle (dark/light), settings, and user profile access.
- **404 Page**: Friendly error page for non-existent routes.
- **Reusable UI Components**: Extensive set of shadcn-ui components for forms, dialogs, navigation, and more.

## Project Structure
- `src/App.tsx`: Main app entry, routing setup.
- `src/pages/`: Contains main pages (Landing, Chat, Dashboard, NotFound).
- `src/components/`: Navigation, ChatSidebar, NavLink, and UI components.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions.
- `public/`: Static assets (robots.txt, logo, etc).

## Technologies Used
- Vite
- React
- TypeScript
- shadcn-ui
- Tailwind CSS
- Radix UI
- React Query
- Lucide Icons

## Lacking/Missing Features & Solutions
1. **Real AI Backend**
   - *Current*: Chat is simulated; no real AI or backend integration.
   - *Solution*: Integrate with OpenAI API or a custom backend for real AI responses.
2. **Authentication/User Profiles**
   - *Current*: No login or user management.
   - *Solution*: Add authentication (e.g., Firebase Auth, Auth0) and user profile features.
3. **Persistent Data/Database**
   - *Current*: No persistent storage for chat, notifications, or user data.
   - *Solution*: Connect to a database (e.g., Firebase, Supabase, MongoDB) for storing user data and chat history.
4. **Mobile Responsiveness**
   - *Current*: Desktop-first design; some mobile support but not fully optimized.
   - *Solution*: Audit and improve mobile layouts, add mobile navigation and touch support.
5. **Accessibility Improvements**
   - *Current*: Basic accessibility; not fully tested.
   - *Solution*: Use tools like axe or Lighthouse to audit and fix accessibility issues.
6. **Deployment Instructions**
   - *Current*: Only basic local setup in README; no production deployment guide.
   - *Solution*: Add instructions for deploying to Vercel, Netlify, or custom server.
7. **Unit/Integration Tests**
   - *Current*: No tests included.
   - *Solution*: Add Jest/React Testing Library tests for components and pages.
8. **Error Handling**
   - *Current*: Minimal error handling (only 404 page).
   - *Solution*: Add error boundaries and user-friendly error messages.

## How to Run Locally
1. Install Node.js & npm.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. Visit `http://localhost:8080/` in your browser.

---

*For more details, see the README.md and source files.*
