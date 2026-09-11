<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# Reconcile 🎯

> **Department of Interpersonal Affairs — Apology Verification Bureau**

## Basic Details

### Team Name: VOID

### Team Members
- Team Lead: Alan Riju
- Member : Albert Anil


### Project Description
Reconcile is a deliberately ridiculous bureaucratic system that determines whether a person is sufficiently sorry before allowing them to send an apology. 

When a user simply wants to say "I'm sorry", our system responds: *"Please submit an application for Apology Verification."* The applicant must navigate an unnecessarily complicated government-style process—complete with queue numbers, administrative waiting rooms, AI clerk interrogations, and remorse evaluations—before their apology can be authorized for dispatch.

### The Problem (that doesn't exist)
In modern society, individuals are able to issue apologies far too easily, without any official government oversight or administrative verification of remorse. Unregulated "I'm sorry" statements are dispatched daily without standardized sincerity checks, resulting in an alarming deficit of bureaucratic friction.

### The Solution (that nobody asked for)
Reconcile introduces an unnecessarily complex Apology Verification Department. The applicant must complete forms, survive administrative waiting, undergo interrogation by an AI Clerk, receive an **AI-estimated remorse score**, and obtain official authorization before their apology can be dispatched to the recipient via an official simulated recipient notification (with optional server-side Twilio integration).

---

## Important Conceptual Clarification
Reconcile evaluates textual indicators associated with apology quality and accountability. The resulting output is designated as an **"AI-estimated remorse score"** or **"Apology sincerity score"**, not a scientific measurement of genuine human emotion.

The system evaluates observable linguistic indicators including:
* **Responsibility acceptance:** Clear acknowledgment of personal role vs. blame-shifting
* **Acknowledgment of impact:** Recognition of how actions affected the recipient
* **Regret indicators:** Meaningful expressions of remorse
* **Future prevention:** Concrete commitments to avoid repeating the behavior
* **Deflection & excuses:** Flagged negatively when blame is deflected
* **Conditional apologies:** Flagged negatively (e.g., *"I'm sorry if you were offended"*)
* **Minimization tactics:** Flagged negatively when the incident is downplayed

---

## Current Implementation Status

*Current Milestone:* **Full-Stack Application Complete — Demo Ready**

| Module | Status | Description |
| :--- | :--- | :--- |
| **Repository & Docs** | ✅ Complete | Project structure, clean architecture, and documentation |
| **Application/Session** | ✅ Complete | In-memory application creation, sequential ticket generation (`A-001`), and retrieval |
| **Backend State Machine** | ✅ Complete | Controlled application lifecycle with enforced state transitions |
| **Apology Application** | ✅ Complete | 7-field apology data model including recipient phone number, validation, and edit protection |
| **AI Clerk Engine** | ✅ Complete | AI Clerk service abstraction (`AIClerk`) with real Gemini provider (`gemini-3.6-flash`) |
| **Remorse Evaluator** | ✅ Complete | Structured JSON output parsing (`remorseScore`, `responsibility`, `impactAcknowledgment`, `regretIndicators`, `deflection`, `summary`) |
| **Backend Evaluation** | ✅ Complete | Deterministic approval/rejection decision rule (`remorseScore >= 70 → APPROVED`) |
| **Frontend Integration** | ✅ Complete | Unified Next.js React UI connected to backend API routes |
| **Approved / Rejected Flow** | ✅ Complete | End-to-end user journey with official certificates and denial notices |
| **Recipient Simulation** | ✅ Complete | Dynamic simulated recipient notification receipt displaying real application state |
| **Production Build** | ✅ Complete | Production build (`npm run build`) verified with zero errors |
| **WhatsApp Dispatch** | 🟡 Optional | Server-side Twilio integration present; simulated notification used for hackathon demo |

---

## Verification Status

The current full-stack implementation has been verified through the following checks:

* **TypeScript Compilation:** PASSED (`npx tsc --noEmit` — 0 errors)
* **Production Build:** PASSED (`npm run build` — verified static page generation)
* **Live Gemini API Integration:** PASSED (tested with real `gemini-3.6-flash` model via `@google/genai`)
* **Browser End-to-End Testing:** PASSED (verified complete flow for both APPROVED and REJECTED applications)
* **Simulated Recipient Notification:** PASSED (dynamic rendering of sender, recipient, phone, score, and message)
* **Security Check:** PASSED (`.env.local` ignored in `.gitignore`, `.env.example` placeholder only, 0 exposed keys)

---

## Current Backend Flow

```text
Landing Screen
  └──> Obtain Ticket Number (e.g., A-001)
         └──> Waiting Room
                └──> Form 7-B (Apology Application & Recipient Phone)
                       └──> Statement of Genuine Remorse
                              └──> AI Clerk Interrogation (AO-7741)
                                     └──> Gemini Evaluation (gemini-3.6-flash)
                                            ├──> APPROVED (score >= 70)
                                            │      └──> Certificate
                                            │             └──> Send Apology
                                            │                    └──> Simulated Recipient Notification
                                            │
                                            └──> REJECTED (score < 70)
                                                   └──> Application Denied Notice
```

> [!NOTE]
> **Simulated Recipient Notification:** For hackathon demonstration reliability, Reconcile displays an official simulated recipient receipt displaying real application state data (Sender, Recipient, Phone, Score, Statement, and Transmission Status). An optional server-side Twilio WhatsApp dispatch integration is present for real messaging use.

---

## API Overview

| Endpoint | Method | Purpose | Key Payload / Params |
| :--- | :--- | :--- | :--- |
| `/api/application` | `POST` | Create new apology application session | `{ "applicantName"?: "..." }` |
| `/api/application` | `GET` | Retrieve application details | Query params: `?id=...` or `?ticketNumber=...` |
| `/api/application` | `PATCH` | Update apology data, submit, or transition status | `{ "id": "...", "action": "update"|"submit"|"status", "apology"?: { ... } }` |
| `/api/application/[id]/evaluate` | `POST` | Trigger AI Clerk evaluation for submitted apology | Path param: `id` |
| `/api/application/[id]/dispatch` | `POST` | Trigger apology dispatch & state transition | Path param: `id` |

---

## Technical Details

### Technologies / Components Used

#### Frontend
- **Framework:** Next.js 14 App Router, React
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Custom CSS (Retro CRT Bureaucratic Interface Aesthetic)

#### Backend
- **Runtime & API:** Next.js API Routes / Node.js
- **Language:** TypeScript
- **AI Intelligence:** Gemini API (`@google/genai` — model `gemini-3.6-flash`)
- **Messaging Dispatch:** Simulated Recipient Notification (Optional server-side Twilio WhatsApp integration present)

---

### High-Level Architecture

```text
┌──────────────────────────┐
│   Next.js / React UI     │
│       (Frontend)         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      API Routes          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   Application Service    │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌────────────┐ ┌────────────┐
│   State    │ │  AI Clerk  │
│  Manager   │ │  Service   │
└─────┬──────┘ └─────┬──────┘
      │              │
      ▼              ▼
┌────────────┐ ┌────────────┐
│   State    │ │   Gemini   │
│   Machine  │ │    API     │
└────────────┘ └─────┬──────┘
                     │
                     ▼
              ┌──────────────┐
              │   Validate   │
              │ AI Result    │
              └──────┬───────┘
                     │
                     ▼
              Backend Decision
                     │
                     ▼
             APPROVED / REJECTED
                     │
                     ▼
      Simulated Recipient Notification
```

---

## Implementation & Setup

### Software Setup & Running

```bash
# Installation
npm install

# Environment Configuration
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Philosophy
Built during the **TinkerHub Useless Projects 3.0** 18-hour makeathon, our development philosophy favors:
$$\text{Simple} + \text{Working} + \text{Funny} \quad > \quad \text{Complex} + \text{Technically Impressive} + \text{Unfinished}$$

We prioritize a complete, polished, and hilarious interaction over unnecessary backend infrastructure.

---

## Project Documentation

### Screenshots (TODO)
![Screenshot1]

### Diagrams
```text
Landing ──> Get Queue No. ──> Waiting Room ──> Apology Form ──> Submit ──> AI Clerk ──> Remorse Evaluation ──> Dispatch Authorization ──> Simulated Recipient Notification
```
*User Journey Workflow (Full Product Vision)*

---

## Project Demo

### Video
[TODO: Add demo video link here]
*Explanation of demo video*

### Additional Demos
[TODO: Add any extra demo materials/links]

---

## Team Contributions
- **Alan Riju (Team Lead):** Frontend development, UI/UX, waiting-room experience,
application screens, frontend/backend integration
- **Albert Anil:** Backend architecture, state machine, API design, Gemini integration, evaluation system, notification architecture, full-stack integration and testing

---

Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
