# **🤖 Advanced AI Code Reviewer**

A multi-modal, educational code review platform that goes beyond simple linting. This project uses a **Next.js** frontend for an interactive experience, a **NestJS** orchestration layer for API management, and a **Python FastAPI** engine for advanced LLM analysis, security stress-testing, and audio generation.

## **🏗 Architecture**

The system operates as a four-tier application:

1. **Frontend (Next.js)**: Interactive UI for code submission, chat, audio playback, and logic visualization.  
2. **Orchestrator (NestJS)**: The primary API Gateway. Handles Auth, User Management, and orchestrates flows between the client, database, and AI engine.  
3. **Database (PostgreSQL)**: Persists user data, authentication credentials, review history, and chat logs.  
4. **AI Engine (Python FastAPI)**: The "brain" that interfaces with LLMs to generate personas, security exploits, and audio.

## **✨ Key Features**

### **🎭 Persona-Based Reviews**

Select the "vibe" of your review:

* **The Roast Master:** Sarcastic, brutally honest feedback.  
* **The Socrates:** Asks probing questions instead of giving answers.  
* **The Security Paranoiac:** Treats every line as a vulnerability.

### **🛡️ Red-Team Mode**

Actively attempts to "break" your code. Instead of just flagging a vulnerability, the AI generates a specific exploit script (e.g., a SQL injection curl command) to demonstrate the risk.

### **📊 Logic Visualization**

Visual learners rejoice. The system automatically converts complex control flow (nested if/else, loops) into a **Mermaid.js flowchart**, allowing you to see the logic structure at a glance without reading every line.

### **🗣️ Conversational Review**

Don't just read the review—chat with it. Highlight a line of code and ask, "Why is this bad?" The system maintains context to answer follow-up questions.

### **🎧 Audio Code Walkthroughs**

Turn code reviews into a podcast. The Python service generates a natural-language script of the critique and converts it to audio, allowing you to listen to feedback on the go.

### **🔑 Hybrid API Key System (BYO-Key)**

* **Free Tier:** Uses the system's default model (e.g., Gemini Flash or GPT-3.5).  
* **Pro Tier:** Users can input their own API Key to unlock GPT-4 or Claude 3.5 Sonnet.

## **🗄️ Database & Storage**

We use **PostgreSQL** (via **Prisma ORM** or **TypeORM**) to handle persistence.

**Key Entities:**

* **Users:** Stores generic user profiles and hashed passwords (bcrypt).  
* **Reviews:** Stores the raw code snippet, the generated JSON critique, and the unique ID of the review.  
* **Conversations:** Stores the chat history (user prompts \+ AI responses) linked to a specific Review ID.  
* **Settings:** Stores user preferences (e.g., default Persona, API Key references).

## **🔐 Authentication**

Authentication is managed by the **NestJS** service using Passport.js and JWT.

1. **Sign Up/Login:** Users authenticate via email/password or OAuth (GitHub/Google).  
2. **JWT Token:** On success, the backend issues a JSON Web Token.  
3. **Protected Routes:** All "Save History" and "Pro Feature" endpoints are guarded. The Frontend attaches the token (Authorization: Bearer \<token\>) to requests.  
4. **Guest Mode:** Users can still generate reviews as "Guests," but their history will not be saved.

## **🛠 Tech Stack**

* **Frontend:** Next.js 14 (App Router), Tailwind CSS, React Markdown, Mermaid.js.  
* **Backend:** NestJS, Socket.io (for chat), Prisma ORM, Passport.js.  
* **Database:** PostgreSQL.  
* **AI Engine:** Python 3.9+, FastAPI, LangChain, gTTS.

## **🚀 Installation & Setup**

### **1\. Database (PostgreSQL)**

The easiest way to run the DB is via Docker.

\# Run Postgres in background  
docker run \--name codereview-db \-e POSTGRES\_PASSWORD=mysecretpassword \-e POSTGRES\_DB=codereview \-p 5432:5432 \-d postgres

### **2\. AI Engine (Python FastAPI)**

Navigate to the python service directory:

cd ai-service  
python \-m venv venv  
source venv/bin/activate  \# Windows: venv\\Scripts\\activate  
pip install fastapi uvicorn openai langchain gtts python-dotenv

Create a .env file:

OPENAI\_API\_KEY=sk-your-system-key  
PORT=8000

Start the server:

uvicorn main:app \--reload \--port 8000

### **3\. Backend (NestJS)**

Navigate to the NestJS directory:

cd backend  
npm install

Create a .env file:

AI\_SERVICE\_URL=http://localhost:8000  
\# Connect to the Docker DB  
DATABASE\_URL="postgresql://postgres:mysecretpassword@localhost:5432/codereview?schema=public"  
JWT\_SECRET="super-secret-key"

Start the server:

\# Run migrations (if using Prisma)  
npx prisma migrate dev  
\# Start App  
npm run start:dev

### **4\. Frontend (Next.js)**

Navigate to the frontend directory:

cd frontend  
npm install mermaid

Create a .env.local file:

NEXT\_PUBLIC\_API\_URL=http://localhost:3000

Start the client:

npm run dev

## **⚙ Configuration (BYO-Key)**

The application supports a "Bring Your Own Key" headers strategy.

1. **Frontend:** Stores the user's API key in localStorage or secure session state.  
2. Request: When sending a request to NestJS, the frontend adds:  
   x-custom-api-key: sk-user-123...  
3. **Backend:** NestJS passes this header to Python.  
4. **Python Logic:**  
   def get\_llm\_client(request: Request):  
       user\_key \= request.headers.get('x-custom-api-key')  
       if user\_key:  
           return OpenAI(api\_key=user\_key) \# User pays  
       return OpenAI(api\_key=os.getenv("SYSTEM\_KEY")) \# App pays

## **💻 Usage**

1. Open http://localhost:3001.  
2. **Login** (Optional) to save your history.  
3. Paste a code snippet into the editor.  
4. **Select a Persona** (e.g., "Roast Master").  
5. Toggle **Red Team Mode** if you want security exploits.  
6. Click **Review**.  
7. **Visualize**: Switch to the "Flowchart" tab to see the Mermaid.js diagram.  
8. **Chat**: Use the right-hand panel to ask follow-up questions.  
9. **Listen**: Click the "Play Audio" button to hear the review.

## **🛡️ License**

This project is licensed under the MIT License.
