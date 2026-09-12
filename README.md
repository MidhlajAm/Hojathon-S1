# Hojathon

Build agents that don't just respond — they act.

Hojathon is an agentic AI hackathon. Teams build systems that can reason, plan, call tools or APIs, and carry out multi-step tasks on their own — not just chatbots that answer a single prompt. This repository is the official starter and submission template: fork it, build your project inside your fork, and submit your final work back here through a Pull Request.

There's no required stack. Build your agent with any language, any framework, any model provider or orchestration approach — LangChain, a custom agent loop, raw API calls, whatever gets the job done. This repo itself contains no code. It's just the structure and docs every team needs so judges can actually run and evaluate what you built.

---

## Getting Started

1. **Fork this repository** — click "Fork" at the top of this page, then click the green **"Create fork"** button on the page that follows to confirm.
2. **Clone your fork** to your computer:
   ```bash
   git clone https://github.com/<your-username>/<your-fork>.git
   ```
3. **Read through this README and the [`docs/`](docs/) folder in full** before you write any code, so you understand the rules, the workflow, and what your final submission needs to include.
4. **Add your teammates as collaborators** on your fork (GitHub → Settings → Collaborators) so everyone can push directly.
5. **Build your project** inside your fork, using whatever stack fits your idea.
6. **Commit and push regularly** — don't wait until the deadline to save your work.
7. **Fill in the project documentation** (see [Project Documentation](#project-documentation) below and the [`docs/`](docs/) folder).
8. **Open your final Pull Request** back to this repository before the deadline.

---

## Team Information

Fill this in as soon as your team is formed.

**Team ID:**

**Team Name:*Nexaris*

**Team Members:**

1. Shibin Up
2. Midhlaj AM
3. Rushda
4. Aber

**Project Name:** CivicConnect AI

> Teams may have **1, 2, or 3 members**.

---

## Project Documentation

Replace the placeholders below with your own project's details — this is what judges will actually read.

### Project Name

CivicConnect AI

### Team

Nexaris (Shibin Up, Midhlaj AM, Rushda, Aber)

### Problem Statement

Citizens frequently notice civic issues like severe potholes, broken streetlights, or uncollected garbage but rarely report them. The reporting process is often fragmented, requires navigating complex government websites to find the right authority, and involves filling out tedious forms. This creates a massive disconnect between issues on the ground and the authorities responsible for resolving them. 

This problem calls for an **agent** rather than a static form because the system needs to intelligently reason over unstructured data (photos and locations), figure out the jurisdiction, draft a formal complaint based on context, and execute the submission on behalf of the user. An agent handles the complexity so the citizen doesn't have to.

### Proposed Solution

**CivicConnect AI** is an Agentic AI-powered civic issue platform that acts as an intermediary between citizens and authorities. A user simply snaps a photo of a civic issue and their location. Our AI agent (powered by Gemini) analyzes the image, understands the problem and its severity, determines the appropriate local authority, and automatically prepares a formal complaint. Once the user approves, the agent submits the complaint and tracks its status. The platform also includes a Reddit-style feed and an interactive map, fostering a community around civic engagement.

### Key Features

* **Agentic Issue Reporting:** Upload a photo, and the AI agent automatically identifies the issue, assesses severity, and determines the responsible authority.
* **Automated Complaint Generation & Submission:** The agent drafts formal complaints and acts on the user's behalf to submit them through appropriate channels.
* **Interactive Civic Map:** A geographical view to discover and track civic issues reported in your neighborhood.
* **Community Feed:** A Reddit-style platform where citizens can view, upvote, discuss trending civic issues, and discover local civic events.

### Technology Stack

| Category | Technology |
| -------- | ---------- |
| Frontend | Next.js, React, Tailwind CSS |
| Backend  | Next.js API Routes / Server Actions |
| Database | MongoDB |
| AI/ML    | Google AI Studio, Gemini API (@google/genai) |
| APIs     | Nodemailer (Email Integration), Leaflet (Maps) |

### How It Works

The platform revolves around a Gemini-powered Agentic workflow seamlessly integrated with a Next.js application:
1. **Understand:** A citizen uploads a photo and location. The Gemini Vision model analyzes the image to identify the issue (e.g., "Severe Pothole") and assess its severity.
2. **Decide:** Based on the identified issue and geographic location, the agent determines the appropriate civic authority (e.g., "Local Road Authority").
3. **Use Tools:** The agent utilizes internal tools (Next.js server actions) to draft a formal complaint email to the identified authority.
4. **Take Action:** After presenting the drafted complaint for user confirmation, the agent uses Nodemailer to officially submit the complaint. 
5. **Remember & Display:** The Next.js backend stores the complaint in MongoDB and updates the platform's community feed and Leaflet-powered map, allowing users to track the issue's resolution status.

### Setup & Installation

```bash
# Clone your fork
git clone https://github.com/<your-username>/Hojathon-S1.git

# Navigate into the project directory
cd Hojathon-S1

# Install dependencies
npm install

# Configure environment variables
# Create a .env.local file in the root directory and add:
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
# Add any other necessary keys (e.g., for Nodemailer)
```

### Running the Project

```bash
# Start the development server
npm run dev
```
Open `http://localhost:3000` in your browser.
Judges can test the platform by clicking "Report Issue", uploading a sample photo of a civic problem (like a pothole), and observing the AI agent analyze the issue, draft the complaint, and wait for confirmation before submission.

---

## Participant Rules

* Teams must contain **1–3 members**.
* Teams may use **any technology stack**.
* Teams should commit their work regularly.
* Do **not** commit passwords, API keys, tokens, or other secrets.
* The final state of the repository at the submission deadline will be considered for judging.
* The final Pull Request must be submitted before the official deadline.
* Participants are responsible for ensuring their project can be evaluated.

---

## GitHub Workflow

```
Official Hojathon Repository
        ↓
      Fork
        ↓
   Team's Fork
        ↓
  Build Project
        ↓
  Commit & Push
        ↓
 Complete README
        ↓
   Final PR
        ↓
   Organizers
        ↓
    Judges
```

Don't open a Pull Request for every change. Work normally inside your own fork, committing and pushing as often as you like — only open a Pull Request to the official repository when you're ready to make your **final submission**.

---

## Final Pull Request

When your project is ready, open a Pull Request from your fork's default branch into the official Hojathon repository.

**PR title format:**

```
[TEAM-ID] Project Name
```

**Example:**

```
[TEAM-042] Smart Campus Assistant
```

**The PR description must contain:**

* Team ID
* Team name
* Team members
* Project name
* Problem statement
* Solution
* Technology stack
* Demo URL
* Demo video
* Special instructions for judges

See [`docs/SUBMISSION.md`](docs/SUBMISSION.md) for the full submission checklist and process, and use the [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md) when you open your final PR.
