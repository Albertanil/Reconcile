<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# Reconcile 🎯

> **Department of Interpersonal Affairs — Apology Verification Bureau**

## Basic Details

### Team Name: VOID

### Team Members
- Team Lead: Alan Riju
- Member 2: Albert Anil


### Project Description
Reconcile is a deliberately ridiculous bureaucratic system that determines whether a person is sufficiently sorry before allowing them to send an apology. 

When a user simply wants to say "I'm sorry", our system responds: *"Please submit an application for Apology Verification."* The applicant must navigate an unnecessarily complicated government-style process—complete with queue numbers, administrative waiting rooms, AI clerk interrogations, and remorse evaluations—before their apology can be authorized for dispatch.

### The Problem (that doesn't exist)
In modern society, individuals are able to issue apologies far too easily, without any official government oversight or administrative verification of remorse. Unregulated "I'm sorry" statements are dispatched daily without standardized sincerity checks, resulting in an alarming deficit of bureaucratic friction.

### The Solution (that nobody asked for)
Reconcile introduces an unnecessarily complex Apology Verification Department. The applicant must complete forms, survive administrative waiting, undergo interrogation by an AI Clerk, receive an **AI-estimated remorse score**, and obtain official authorization before their apology can be dispatched to the recipient via WhatsApp.

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

*Current Milestone:* **Backend MVP Complete — Frontend Integration Pending**

| Module | Status | Description |
| :--- | :--- | :--- |
| **Repository & Docs** | ✅ Complete | Project structure, clean architecture, and documentation |
| **Application/Session** | ✅ Complete | In-memory application creation, sequential ticket generation (`A-001`), and retrieval |
| **Backend State Machine** | ✅ Complete | Controlled application lifecycle with enforced state transitions |
| **Apology Application** | ✅ Complete | 7-field apology data model, required field validation, and post-submission edit protection |
| **AI Clerk Engine** | ✅ Complete | AI Clerk service abstraction (`AIClerk`) with real Gemini provider (`gemini-3.6-flash`) |
| **Remorse Evaluator** | ✅ Complete | Structured JSON output parsing (`remorseScore`, `responsibility`, `impactAcknowledgment`, `regretIndicators`, `deflection`, `summary`) |
| **Backend Evaluation** | ✅ Complete | Deterministic approval/rejection decision rule (`remorseScore >= 70 → APPROVED`) |
| **WhatsApp Dispatch** | ⏳ Planned | Twilio WhatsApp API integration |
| **Frontend UI** | ⏳ In Progress / Planned | Next.js/React user interface |
| **3D Waiting Room UI** | ⏳ Planned | Frontend Three.js / React Three Fiber (R3F) experience |

---

## Verification Status

The backend implementation has been fully verified end-to-end:

* **TypeScript Compilation:** PASSED (`npx tsc --noEmit` — 0 errors)
* **Production Build:** PASSED (`npm run build`)
* **Automated Test Suites:** PASSED (5/5 test suites, 87 total assertions passed)
* **Live Gemini API Integration:** PASSED (tested with real `gemini-3.6-flash` model via `@google/genai`)
* **Live HTTP REST API Suite:** PASSED (20 passed, 0 failed against live Next.js server)
* **Security Check:** PASSED (`.env` ignored in `.gitignore`, `.env.example` placeholder only, 0 exposed keys)

---

## Current Backend Flow

```text
1. Applicant creates an application.
2. System assigns a queue/application number (e.g., A-001).
3. Applicant fills out the 7 required apology information fields.
4. Backend validates required fields and submits the apology (status: FORM_SUBMITTED).
5. AI Clerk sends the apology to Gemini for evaluation (model: gemini-3.6-flash).
6. Gemini returns a structured assessment (remorseScore 0-100, categorical indicators, summary).
7. Backend validates the AI result schema and range.
8. Backend applies the approval threshold (score >= 70 → APPROVED, score < 70 → REJECTED).
9. State machine transitions the application to APPROVED or REJECTED state.
```

---

## API Overview

| Endpoint | Method | Purpose | Key Payload / Params |
| :--- | :--- | :--- | :--- |
| `/api/application` | `POST` | Create new apology application session | `{ "applicantName"?: "..." }` |
| `/api/application` | `GET` | Retrieve application details | Query params: `?id=...` or `?ticketNumber=...` |
| `/api/application` | `PATCH` | Update apology data, submit, or transition status | `{ "id": "...", "action": "update"|"submit"|"status", "apology"?: { ... } }` |
| `/api/application/[id]/evaluate` | `POST` | Trigger AI Clerk evaluation for submitted apology | Path param: `id` |

---

## Technical Details

### Technologies / Components Used

#### Frontend (Planned / In Progress)
- **Framework:** Next.js, React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber (R3F)

#### Backend (Implemented)
- **Runtime & API:** Next.js API Routes / Node.js
- **Language:** TypeScript
- **AI Intelligence:** Gemini API (`@google/genai` — model `gemini-3.6-flash`)
- **Messaging Dispatch:** Twilio API (WhatsApp — Planned)

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
Landing ──> Get Queue No. ──> Waiting Room ──> Apology Form ──> Submit ──> AI Clerk ──> Remorse Evaluation ──> Dispatch Authorization ──> WhatsApp Recipient
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
- **Alan Riju (Team Lead):** [Frontend]
- **Albert Anil:** [Backend]

---

Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
