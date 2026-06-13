# NeuroPlay AI Agent Workflow

This document explains how the proposed AI agent workflow connects to NeuroPlay's existing therapeutic gaming platform. The current project already captures game performance, face-expression signals, pose data, hand-tracking activity, eye-gaze metrics, and user progress through a React frontend and Express/MongoDB backend. The workflow below describes how those signals can be organized into an AI-assisted therapy support layer.

## Workflow Diagram

```mermaid
flowchart TD
    A["1. Login<br/>Roles: student, parent, therapist, admin"]
    B["2. Memory / Context<br/>Language preference, child profile, therapist notes"]
    C["3. Game Domain Router<br/>Routes selected activity to the relevant therapy domain"]

    A --> B --> C

    C --> D1["ABA Protocols<br/>Behavioral patterns"]
    C --> D2["SLP Protocols<br/>Communication and speech"]
    C --> D3["OT Protocols<br/>Motor skills and coordination"]
    C --> D4["Memory Games<br/>Recall, attention, and sequencing"]
    C --> D5["Eye Gaze Data<br/>Engagement and attention signals"]
    C --> D6["Educational Videos<br/>Learning and content interaction"]

    D1 --> E["4. Knowledge Retrieval<br/>7-day session history, performance metrics, and therapy goals"]
    D2 --> E
    D3 --> E
    D4 --> E
    D5 --> E
    D6 --> E

    E --> F["5. Merge / Join<br/>Combine domain streams, session history, and current results"]
    F --> G["6. Analysis Prompt Template<br/>Structured clinical-style summary format"]
    G --> H["7. LLM Analyzer<br/>Identifies fatigue vs skill gap, domain patterns, and session summary"]
    H --> I["8. Evaluator / Guardrail<br/>Checks for safety, uncertainty, and no medical diagnosis"]

    I --> J["9. Parent Communicator<br/>Converts analysis into a warm, simple summary in the parent's language"]
    J --> K["10. Parent Notification Tool<br/>Email, dashboard notification, or speech output"]

    K --> L["11. Triage Router<br/>Green: proceed, Yellow: retry, Red: escalate"]

    L -->|Green| M["12. Therapy Planning Prompt<br/>Structures analysis for next-session planning"]
    L -->|Yellow retry| H
    L -->|Red escalate| R["Human Handoff<br/>Alert therapist immediately"]

    M --> N["13. LLM Planner<br/>Proposes next game sequence and difficulty"]
    N --> O{"Planner confidence high?"}

    O -->|No retry| N
    O -->|Yes| P["14. Therapist Handoff<br/>Therapist reviews and approves the next session plan"]

    P --> Q["15. Adaptive Difficulty Code<br/>Applies domain rules and builds structured JSON output"]
    Q --> S["16. Output Formatter<br/>JSON, PDF, and therapist dashboard output"]
    Q --> T["17. Next Session Loop<br/>Returns to the game domain router"]

    T -.-> C
```

## How This Relates To NeuroPlay

NeuroPlay is the data-producing platform: children complete therapeutic games and activities while the system records scores, reaction time, accuracy, expression data, movement quality, gaze behavior, and progress over time.

The AI agent workflow is the interpretation layer: it takes those raw signals, routes them into therapy domains, summarizes patterns, communicates results to parents, and prepares therapist-reviewed next-session plans.

## Implemented Foundation

- 6 therapeutic games covering emotion recognition, reaction patterns, facial expression practice, pose imitation, sound localization, and hand-tracking coordination.
- 4 role-based dashboards for student, parent, therapist, and admin workflows.
- Real-time browser-based AI/ML using face-api.js, TensorFlow.js, MediaPipe, and WebGazer.
- MongoDB-backed storage for users, game sessions, progress, face capture, gaze tracking, and videos.
- JWT authentication, protected routes, multilingual support, and clinical analytics views.

## Proposed AI Agent Layer

- Domain router that maps each game or activity to behavior, communication, motor, memory, gaze, or educational categories.
- Retrieval step that combines current results with recent session history and therapy goals.
- LLM analyzer that summarizes performance patterns such as fatigue, skill gaps, and progress trends.
- Safety guardrail that blocks medical diagnosis language and escalates uncertain or high-risk outputs.
- Parent communicator that converts technical results into a clear summary in the parent's preferred language.
- Triage router that labels sessions as green, yellow, or red based on confidence and risk.
- Planner that proposes next-session game sequence and difficulty, requiring therapist approval before use.

## Safety Design

The workflow is designed as a support tool, not an autonomous diagnostic system. AI-generated outputs should avoid medical diagnosis, include uncertainty where appropriate, and require therapist review for therapy planning. Red triage cases are routed directly to human handoff.

## Recruiter Summary

NeuroPlay combines full-stack product engineering with applied AI and responsible workflow design: a therapeutic gaming platform that can evolve from raw interaction tracking into AI-assisted, therapist-supervised progress analysis and adaptive session planning.
