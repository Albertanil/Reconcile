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
The AI does **NOT** scientifically detect whether a person genuinely feels an emotion. Instead, the system evaluates textual indicators associated with a sincere apology, including:
* Responsibility acceptance
* Acknowledgment of impact
* Regret indicators
* Future prevention commitment
* Deflection & excuses (flagged negatively)
* Conditional apologies (e.g., *"I'm sorry if..."*)
* Minimization tactics

All evaluation outputs are designated as **"AI-estimated remorse"** or **"Apology sincerity score"** rather than definitive emotional proof.

---

## Current Implementation Status
| Module | Status | Description |
| :--- | :--- | :--- |
| **Repository & Docs** | 🟡 Initial Setup | Project structure & documentation setup |
| **Backend State Machine** | ⏳ Planned | Session & application status control |
| **AI Clerk Engine** | ⏳ Planned | Gemini API integration for interrogation |
| **Remorse Evaluator** | ⏳ Planned | Gemini API structured remorse scoring |
| **WhatsApp Dispatch** | ⏳ Planned | Twilio WhatsApp API integration |
| **3D Waiting Room UI** | ⏳ Planned | Frontend Three.js / R3F experience |

*Current Milestone:* **Initial Setup / Planning**

---

## Development Philosophy
Built during the **TinkerHub Useless Projects 3.0** 18-hour makeathon, our development philosophy favors:
$$\text{Simple} + \text{Working} + \text{Funny} \quad > \quad \text{Complex} + \text{Technically Impressive} + \text{Unfinished}$$

We prioritize a complete, polished, and hilarious interaction over unnecessary backend infrastructure.

---

## Technical Details

### Technologies / Components Used

#### Frontend
- **Framework:** Next.js, React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber (R3F)

#### Backend
- **Runtime & API:** Next.js API Routes / Node.js
- **Language:** TypeScript
- **AI Intelligence:** Gemini API (`@google/generative-ai`)
- **Messaging Dispatch:** Twilio API (WhatsApp)

### High-Level Architecture

```text
Browser / Next.js Frontend
          │
          ▼
 Next.js API Routes
    ├──> Gemini API (Clerk Interrogation & Remorse Evaluation)
    ├──> Scoring Engine & Application State Machine
    └──> Twilio API (WhatsApp Dispatch)
          │
          ▼
      Recipient
```

---

## Implementation

### Software Setup & Running

```bash
# Installation
npm install

# Development Server
npm run dev
```

---

## Project Documentation

### Screenshots (TODO)
![Screenshot1]

### Diagrams
```text
Landing ──> Get Queue No. ──> Waiting Room ──> Form Submission ──> AI Clerk Interrogation ──> Remorse Evaluation ──> Dispatch Authorization ──> WhatsApp Recipient
```
*User Journey Workflow*

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
