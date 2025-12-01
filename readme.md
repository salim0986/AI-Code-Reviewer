# **🤖 Sentinel AI: Enterprise Code Review Platform**

**Zero-friction, context-aware code reviews integrated directly into your CI/CD pipeline.**

Sentinel AI is not just another "paste-bin" for code. It is an autonomous code quality platform that connects to your GitHub repository, understands your entire codebase structure via Vector Embeddings (RAG), and provides persona-driven feedback directly on Pull Requests.

## **🚀 Why Sentinel? (The Product Vision)**

Manual copy-pasting is for toys. Professional teams need integration.

* **Zero-Click Workflow:** You push code, we review it. No dashboard toggling required.  
* **Context-Aware (RAG):** Unlike generic ChatGPT wrappers, Sentinel indexes your repository. If you change a generic interface, Sentinel knows which 50 files might break, even if they aren't in the PR.  
* **Red-Team Security:** We don't just lint; we try to hack you. The AI generates specific exploit scripts for detected vulnerabilities.  
* **Audio Debriefs:** Turn complex PR reviews into a 2-minute audio summary for your morning commute.

## **🏗 Architecture & Data Flow**

The system operates as a sophisticated microservice mesh:

graph TD  
    User((Developer)) \--\>|Pushes Code| GitHub\[GitHub Repo\]  
    GitHub \--\>|Webhook Event| NestJS\[NestJS Orchestrator\]  
      
    subgraph "The Intelligence Layer"  
        NestJS \--\>|Diff \+ Context| Python\[Python AI Service\]  
        Python \<--\>|Retrieve Embeddings| VectorDB\[(Postgres pgvector)\]  
        Python \<--\>|Generate Review| LLM\[OpenAI / Anthropic\]  
    end  
      
    NestJS \--\>|Post Comment| GitHub  
    NestJS \--\>|Sync Data| DB\[(Postgres Main)\]  
      
    User \--\>|View Analytics| NextJS\[Next.js Dashboard\]  
    NextJS \--\>|API| NestJS

## **✨ Key Features**

### **1\. 🐙 The GitHub Bot (CI/CD Integration)**

* **Automatic Scanning:** Listens for pull\_request.opened and pull\_request.synchronized events.  
* **Inline Comments:** Posts specific, line-by-line critiques directly in the GitHub PR interface.  
* **Smart Diffing:** Only analyzes changed code, but fetches *context* from related files to ensure accuracy.

### **2\. 🧠 Context Engine (RAG)**

* **Repository Indexing:** On installation, the Python service clones the repo, chunks the code, creates embeddings, and stores them in a Vector Database.  
* **Deep Understanding:** It knows your project's architecture, custom types, and utility functions, drastically reducing false positives.

### **3\. 🛡️ Red-Team Mode**

* **Active Exploitation:** The AI attempts to generate curl payloads or Python scripts that prove a vulnerability exists (SQLi, XSS, IDOR).

### **4\. 💻 CLI Tool (sentinel-cli)**

* For developers who want a check *before* pushing.  
* Run npx sentinel review . in your terminal to get an instant analysis of your local changes.

### **5\. 🎭 Configurable Personas**

* **The Roast Master:** Brutal, sarcastic feedback (Great for breaking bad habits).  
* **The Senior Engineer:** Strict, focus on scalability and patterns.  
* **The Security Auditor:** Only cares about vulnerabilities.

### **6\. 🎧 Audio Walkthroughs**

* Converts the text review into a podcast-style MP3 summary using Text-to-Speech, accessible via the Dashboard.

## **🛠 Tech Stack**

* **Frontend (Dashboard):** Next.js 14, Tailwind CSS, Mermaid.js (Visualization).  
* **Orchestrator:** NestJS, Probot (GitHub Apps), BullMQ (Job Queues).  
* **AI Engine:** Python FastAPI, LangChain, Sentence-Transformers (Embeddings).  
* **Database:** PostgreSQL (with pgvector extension for both relational data and vector storage).  
* **Infrastructure:** Docker Compose.

## **🚀 Installation & Setup**

### **Prerequisites**

* Docker & Docker Compose  
* Node.js v18+ & Python 3.9+  
* OpenAI API Key (or Anthropic)

### **1\. Spin up Infrastructure**

We use a single Docker Compose file to spin up Postgres (with Vector support) and Redis.

docker-compose up \-d

### **2\. Configure the AI Service (Python)**

This service handles RAG (Vector Search) and LLM interaction.

cd ai-service  
python \-m venv venv  
source venv/bin/activate  
pip install \-r requirements.txt  
\# Setup .env with OPENAI\_API\_KEY  
uvicorn main:app \--reload \--port 8000

### **3\. Configure the Orchestrator (NestJS)**

This service handles Webhooks and User Auth.

cd backend  
npm install  
\# Setup .env with GITHUB\_APP\_ID, GITHUB\_PRIVATE\_KEY, DATABASE\_URL  
npm run start:dev

### **4\. Setup GitHub App**

1. Go to GitHub Developer Settings \-\> New GitHub App.  
2. Set Webhook URL to your NestJS public URL (use ngrok for local dev: http://your-ngrok.io/webhooks/github).  
3. Permissions: Pull Requests (Read/Write), Contents (Read).  
4. Install the App on your repository.

## **💻 Usage Workflows**

### **Workflow A: The Automated PR (Primary)**

1. Create a branch: git checkout \-b feature/login-fix.  
2. Make changes and push: git push origin feature/login-fix.  
3. Open a Pull Request on GitHub.  
4. **Result:** Within seconds, "Sentinel Bot" comments on your PR with a security analysis and performance score.

### **Workflow B: The Dashboard (Control Center)**

1. Log in to http://localhost:3000.  
2. **Analytics:** View your team's "Code Health" trend over time.  
3. **Settings:** Configure which files to ignore (glob patterns) or set the default "Persona" for your team.  
4. **Audio:** Listen to the audio summary of the latest PRs.

### **Workflow C: The CLI (Local)**

\# Install globally  
npm install \-g @sentinel/cli

\# Run in your project root  
sentinel review \--staged

## **🛡️ License**

This project is licensed under the MIT License. Enterprise features (SAML SSO, On-Premise Deployment) available under Commercial License.