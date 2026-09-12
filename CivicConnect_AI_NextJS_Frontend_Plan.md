# CivicConnect AI — Next.js Frontend Plan

## 1. Project Overview

**CivicConnect AI** is an Agentic AI-powered civic issue platform.

The core idea is:

> **Upload a photo of a civic problem → AI understands the issue → finds the appropriate action/authority → prepares the complaint → user confirms → agent submits it → complaint is tracked.**

The frontend should combine:

- A Reddit-style civic community
- Location-aware issue discovery
- A simple issue-reporting flow
- An AI Agent workspace
- Complaint tracking
- Civic events

The frontend should make it clear that the AI is **taking actions**, not simply answering questions.

---

# 2. Recommended Technology

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Responsive/mobile-first UI

## Backend

Use Next.js for backend functionality:

- Route Handlers / API routes
- Server Actions where appropriate

## AI

- Google AI Studio
- Gemini API
- Gemini vision capabilities for image analysis
- Gemini for agent reasoning and content generation

## Database

- MongoDB

## Image Storage

- Cloudinary

---

# 3. Overall UI Concept

The visual direction should feel like:

> **Reddit + Google Maps + AI Agent**

### Design characteristics

- Clean modern interface
- Light background
- White cards
- Strong readable typography
- Rounded corners
- Large issue photographs
- Clear location indicators
- Severity badges
- AI status indicators
- Responsive mobile layout

Avoid making the platform look like a traditional government portal.

---

# 4. Main Navigation

### Desktop

```text
Home
Map
My Issues
Events

────────────

+ Report Issue

────────────

AI Agent

────────────

Profile
Settings
```

### Mobile

```text
┌──────────────────────────┐
│ CivicConnect             │
│                          │
│        CONTENT           │
│                          │
├──────────────────────────┤
│ 🏠   🗺️   ＋   🤖   👤  │
└──────────────────────────┘
```

The **Report Issue** button should always be easy to access.

---

# 5. Home / Community Feed

The home page is the main community screen.

## Header

```text
CivicConnect

[ Search issues, locations... ]

                    + Report Issue
```

## Filters

```text
Nearby | Trending | Recent | Unresolved
```

## Issue Card

Each issue should display:

- User
- Time
- Location
- Image
- Issue category
- AI analysis
- Severity
- Upvotes
- Comments
- Complaint status

Example:

```text
┌─────────────────────────────────────────┐
│ 👤 Rahul                    12 min ago   │
│ 📍 Near ABC College                     │
│                                         │
│          [ ISSUE PHOTO ]                │
│                                         │
│ 🚨 Severe Pothole                      │
│                                         │
│ AI Analysis                             │
│ Large road damage detected.             │
│ Severity: HIGH                          │
│                                         │
│ 👍 124     💬 18     📍 View Map        │
│                                         │
│ 🤖 Complaint submitted                  │
│ 🟡 Under Review                         │
└─────────────────────────────────────────┘
```

---

# 6. Report Issue Page

This is one of the most important screens.

The goal is to make reporting extremely simple.

## Initial Screen

```text
          Report a Civic Issue

┌─────────────────────────────────────┐
│                                     │
│          📷 Upload Photo            │
│                                     │
│      Drag & drop or browse          │
│                                     │
└─────────────────────────────────────┘

📍 Location
[ Use my location ]

Description (optional)
[ Tell us anything you noticed... ]

          [ Analyze with AI ]
```

### Important UX rule

Do not ask the citizen to complete a long form.

Let the AI determine as much as possible from:

- Image
- Location
- Short description
- User conversation

---

# 7. AI Analysis Screen

After the image is uploaded, show the agent working.

```text
       ✨ Civic AI is analyzing...

              [ IMAGE ]

       🔍 Identifying issue...
       ✓ Issue detected
       ✓ Severity analyzed
       ✓ Location identified
       ✓ Authority being determined
```

Then show the result:

```text
┌─────────────────────────────────────┐
│ 🤖 AI Analysis                      │
│                                     │
│ Issue                               │
│ 🚧 Road Pothole                     │
│                                     │
│ Severity                            │
│ 🔴 High                             │
│                                     │
│ Location                            │
│ 📍 Near ABC College                 │
│                                     │
│ Responsible Authority               │
│ 🏛️ Local Road Authority             │
│                                     │
│ [ Continue ]                        │
└─────────────────────────────────────┘
```

---

# 8. AI Agent Workspace

This should be the key screen for demonstrating Agentic AI.

Do not hide the agent behind only a chatbot.

Show the agent's workflow and actions.

```text
              🤖 Civic Agent

Goal
"Report this pothole"

────────────────────────────────────

✓ Analyzed uploaded image

✓ Identified:
  Road pothole

✓ Estimated severity:
  High

✓ Checked location

✓ Identified responsible authority

● Finding complaint procedure...

○ Preparing complaint

○ Waiting for confirmation
```

This screen should communicate:

> **Understand → Decide → Use Tools → Act**

---

# 9. Complaint Preparation

Once the agent determines the complaint channel, show the generated complaint.

```text
        Complaint Ready

To:
road.authority@example.gov

Subject:
Road damage complaint near ABC College

────────────────────────────────

A severe pothole has been identified
at the reported location...

────────────────────────────────

📎 photo.jpg
📍 Location attached

       [ Edit ]

       [ Confirm & Submit ]
```

## Important

Always show the user what is going to be submitted.

The agent should request confirmation before an external action.

---

# 10. Submission Result

After submission, show a clear success screen.

```text
             ✓

      Complaint Submitted

       CIV-2026-1042

──────────────────────

Issue
Severe Pothole

Authority
Local Road Authority

Submitted
12 September 2026

Status
🟡 Under Review

        [ Track Issue ]
```

---

# 11. My Issues Page

Users should have a central place to track their reports.

```text
My Reports

┌───────────────────────────────┐
│ 🚧 Pothole                    │
│ 📍 ABC College                │
│                               │
│ 🟡 Under Review               │
│ CIV-2026-1042                 │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 💡 Broken Streetlight         │
│ 📍 Main Road                  │
│                               │
│ 🟢 Resolved                   │
│ CIV-2026-0991                 │
└───────────────────────────────┘
```

Filters:

```text
All | Submitted | Under Review | Resolved
```

---

# 12. Map Page

The map gives users a geographical view of civic issues.

```text
┌─────────────────────────────────────────┐
│ 🔎 Search location                      │
│                                         │
│        🟥       🟡                     │
│              📍                         │
│   🟢             🟥                     │
│                                         │
│          🟡                             │
│                                         │
└─────────────────────────────────────────┘

Nearby Issues

🚧 Pothole       0.4 km
🗑️ Garbage       0.8 km
💡 Streetlight   1.1 km
```

Possible future feature:

- Civic issue heatmap
- Filter by category
- Filter by severity
- Filter by status

---

# 13. Duplicate Issue Detection

This can be a standout feature.

If several citizens report the same issue, the AI can identify potentially duplicate reports.

Example:

```text
       🤖 Possible duplicate

We found 4 reports that may describe
the same issue.

┌───────────────────────────────┐
│ 🚧 Major Pothole              │
│ 📍 ABC College Road           │
│                               │
│ 👥 24 people reported this    │
│ 👍 156 supporters             │
│ 📷 12 photos                  │
│                               │
│ 🟡 Complaint Under Review     │
│                               │
│ [ View Combined Issue ]       │
└───────────────────────────────┘
```

This prevents the community from creating many unnecessary duplicate reports.

---

# 14. Events Page

The platform can show relevant civic events.

Examples:

- Community clean-up drives
- Public grievance camps
- Environmental programs
- Public awareness programs
- Local civic activities

Example:

```text
              Civic Events

        Near You

┌───────────────────────────────┐
│ 🧹 Community Clean-up         │
│                               │
│ 📅 18 September               │
│ 📍 2.1 km away                │
│                               │
│ [ View Event ]                │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 🏛️ Public Grievance Camp      │
│                               │
│ 📅 20 September               │
│ 📍 Municipal Hall             │
└───────────────────────────────┘
```

The AI can recommend events based on the user's reported issues.

Example:

> ✨ **Recommended by Civic AI**  
> This event may help with the waste-management issue you reported.

---

# 15. Global AI Agent

Add a floating AI button throughout the platform.

```text
                         ┌─────┐
                         │ 🤖  │
                         └─────┘
```

When clicked, open an AI workspace.

```text
┌─────────────────────────────────────┐
│ 🤖 Civic Agent                 ×    │
├─────────────────────────────────────┤
│                                     │
│ Hi! What would you like to do?      │
│                                     │
│ [ Report an issue ]                 │
│ [ Track my complaint ]              │
│ [ Find nearby issues ]              │
│ [ Find civic events ]               │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Ask anything...                🎤   │
└─────────────────────────────────────┘
```

Example:

**User:**

> Show me unresolved potholes near me.

**Agent:**

> I found 7 unresolved pothole reports within the selected area. Three appear to be high severity.

The UI should then display the matching issues.

---

# 16. Profile Page

Keep the profile simple.

```text
Rahul

📍 Kochi

Issues Reported      18
Issues Supported     42
Issues Resolved      11

────────────────────

My Activity

18 Reports
42 Upvotes
12 Comments
```

Optional:

- Civic contribution score
- Badges
- Report history

Avoid over-gamifying the platform.

---

# 17. Recommended Next.js Structure

```text
civicconnect/
│
├── app/
│   ├── page.tsx
│   │
│   ├── report/
│   │   └── page.tsx
│   │
│   ├── issues/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── my-issues/
│   │   └── page.tsx
│   │
│   ├── map/
│   │   └── page.tsx
│   │
│   ├── events/
│   │   └── page.tsx
│   │
│   ├── agent/
│   │   └── page.tsx
│   │
│   └── api/
│       ├── agent/
│       ├── issues/
│       ├── complaints/
│       ├── authority/
│       └── events/
│
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── IssueCard.tsx
│   ├── IssueFeed.tsx
│   ├── ImageUploader.tsx
│   ├── AIAnalysis.tsx
│   ├── AgentPanel.tsx
│   ├── ComplaintCard.tsx
│   ├── StatusBadge.tsx
│   ├── MapView.tsx
│   └── EventCard.tsx
│
├── lib/
│   ├── gemini.ts
│   ├── mongodb.ts
│   ├── agent/
│   └── tools/
│
└── models/
    ├── User.ts
    ├── Issue.ts
    ├── Complaint.ts
    └── Event.ts
```

---

# 18. Core Agent Tools

The Gemini agent should have access to tools/functions such as:

```text
analyzeIssue(image)
findAuthority(issue, location)
getComplaintRequirements(authority, issue)
generateComplaint(issueDetails)
submitComplaint(complaintDetails)
getComplaintStatus(complaintId)
findEvents(location, category)
```

The important concept is:

> **Gemini is the brain; your Next.js APIs/tools are the hands.**

The model should decide which tool is needed based on the user's goal.

---

# 19. Feature Priority

## 🔴 MUST HAVE

1. Upload issue photo
2. Gemini image analysis
3. Issue classification
4. Location
5. Authority identification
6. Complaint generation
7. User confirmation
8. Complaint submission
9. Complaint tracking

## 🟡 SHOULD HAVE

10. Community feed
11. Upvotes
12. Comments
13. My Issues
14. AI Agent panel
15. Map

## 🟢 IF TIME PERMITS

16. Duplicate detection
17. Civic events
18. Notifications
19. Voice input
20. Multilingual support
21. AI issue prioritization

---

# 20. Recommended MVP User Journey

The entire hackathon demo should work through one strong scenario:

```text
Citizen sees pothole
        ↓
Uploads photo
        ↓
Gemini analyzes photo
        ↓
AI identifies pothole + severity
        ↓
User confirms location
        ↓
Agent identifies authority
        ↓
Agent finds complaint process
        ↓
Agent generates complaint
        ↓
User reviews
        ↓
User confirms
        ↓
Complaint submitted
        ↓
Complaint ID created
        ↓
User tracks complaint
```

This should be the **main story of the application**.

---

# 21. Key UX Principle

Do not build:

> "A website with a chatbot."

Build:

> **"A platform where an AI agent takes a citizen's goal and performs the required work."**

The frontend should visibly communicate:

```text
USER GOAL
    ↓
🤖 UNDERSTAND
    ↓
🧠 DECIDE
    ↓
🔧 USE TOOLS
    ↓
🚀 TAKE ACTION
    ↓
✅ RESULT
    ↓
🧠 REMEMBER
```

The strongest product message is:

> **📷 Upload a photo → 🤖 AI figures out what to do → 👤 You approve → 🚀 Agent takes action.**
