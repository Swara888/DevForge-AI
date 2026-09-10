# DevForge AI

> AI-Powered Developer Workspace for understanding, analyzing, and working with GitHub repositories.

DevForge AI is a full-stack developer workspace that connects to GitHub repositories, indexes their source code, and uses AI-powered retrieval to help developers understand and analyze their codebases.

It combines repository ingestion, code chunking, embeddings, vector search, and Retrieval-Augmented Generation (RAG) to provide repository-aware AI features instead of relying only on generic LLM responses.

## 🚀 Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected API routes
- Authenticated user profile

### 🐙 GitHub Integration

- Connect GitHub account using OAuth
- View accessible repositories
- Import repositories into DevForge AI
- View repository details
- Open repositories through GitHub

### 📂 Repository Indexing

- Import repository contents
- Filter unnecessary files and directories
- Ignore files such as:
  - `.env`
  - `node_modules`
  - `.git`
  - Build and generated files
  - Large files
- Split source code into manageable chunks
- Store code and metadata for retrieval

### 🧠 AI-Powered Code Understanding

- Generate embeddings for indexed code
- Store embeddings using PostgreSQL + pgvector
- Perform semantic similarity search
- Retrieve relevant code based on natural-language queries

### 💬 Repository Chat

Ask questions about an indexed repository using its actual source code.

Examples:

- "How does authentication work?"
- "Explain the backend architecture."
- "Where are complaints created?"
- "How does the frontend communicate with the API?"

The system retrieves relevant code before sending context to the AI model.

### 🔎 AI Code Review

AI-assisted code review based on repository context.

Findings are categorized by severity:

- `INFO`
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

The review system is designed to provide findings supported by the indexed repository code rather than inventing unrelated issues.

### 📚 Documentation Generation

Generate repository-aware technical documentation from indexed source code.

### 🧪 Test Generation

Generate tests based on existing repository code.

Generated tests are intended to be reviewed by the developer before execution.

## 🏗️ Architecture

DevForge AI follows a modular monolith architecture.

```text
                         ┌─────────────────────┐
                         │       GitHub        │
                         │   OAuth + Repos     │
                         └──────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                    │
│                                                         │
│ Dashboard │ Repositories │ Chat │ Review │ Docs │ Tests │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Express + TypeScript API               │
│                                                         │
│ Routes → Middleware → Controllers → Services → Data     │
└───────────────┬───────────────────────────┬─────────────┘
                │                           │
                ▼                           ▼
       ┌─────────────────┐         ┌──────────────────┐
       │   PostgreSQL    │         │      AI / RAG    │
       │   + Prisma      │         │                  │
       │   + pgvector    │◄────────│ Embeddings       │
       └─────────────────┘         │ Retrieval        │
                                   │ Gemini / LLM      │
                                   └──────────────────┘
```

## 🧠 RAG Pipeline


GitHub Repository
       │
       ▼
Repository Ingestion
       │
       ▼
File Filtering
       │
       ▼
Code Chunking
       │
       ▼
Embeddings
       │
       ▼
PostgreSQL + pgvector
       │
       ▼
Semantic Retrieval
       │
       ▼
Relevant Code Context
       │
       ▼
LLM
       │
       ▼
Repository-Aware Response



## 🛠️ Tech Stack
### Frontend
Next.js
React
TypeScript
Tailwind CSS
Axios

### Backend
Node.js
Express
TypeScript
Prisma ORM
JWT Authentication

### Database
PostgreSQL
pgvector

### AI
Google Gemini
Embeddings
Retrieval-Augmented Generation (RAG)
Semantic vector search

### Integrations
GitHub OAuth
GitHub API

### DevOps
Docker
Docker Compose
GitHub Actions

## 📁 Project Structure


DevForge-AI/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── scripts/
│   │   └── ...
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
│
├── docker-compose.yml
├── .gitignore
└── README.md


## ⚙️ Local Setup

### Prerequisites

Make sure you have:

Node.js
npm
Docker Desktop
Git
GitHub OAuth application
Gemini API key

1. Clone the repository

```cmd
git clone https://github.com/Swara888/DevForge-AI.git
cd DevForge-AI
```

2. Configure environment variables

Create the required environment files locally.

Do not commit .env files or API keys to GitHub.

Example backend configuration:

```cmd
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/github/callback

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

Frontend:

```cmd
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

3. Start the database and services
```cmd
docker compose up -d
```

Check the containers:

```cmd
docker compose ps
```

4. Start the application

Backend:

```cmd
cd backend
npm install
npm run dev
```

Frontend:

```cmd
cd frontend
npm install
npm run dev
```

The application runs at:

```cmd
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## 🔒 Security

DevForge AI uses basic security practices including:

JWT-based authentication
Protected API routes
Environment variables for secrets
.gitignore protection for environment files
Repository file filtering
Exclusion of .env files during repository ingestion
File-size limits during ingestion

Never commit:

.env
.env.local
API keys
GitHub client secrets
JWT secrets
Database passwords


## 🧪 Example Workflow

A typical DevForge AI workflow:

1. Register / Login
        ↓
2. Connect GitHub
        ↓
3. Select a repository
        ↓
4. Import repository
        ↓
5. Index repository
        ↓
6. Generate embeddings
        ↓
7. Ask questions / Review / Generate Docs / Generate Tests

## 📌 Current Status

The core DevForge AI implementation is functional.

Currently implemented:

Authentication
GitHub OAuth integration
Repository import
Repository indexing
File filtering
Code chunking
Embeddings
PostgreSQL + pgvector storage
Semantic retrieval
RAG-based repository chat
AI code review
Documentation generation
Test generation
Docker-based development environment

Current focus is on improving reliability, testing, security, and developer experience.

## 🎯 Project Goals

The goal of DevForge AI is to provide a single workspace where developers can:

Understand unfamiliar repositories
Search code using natural language
Ask questions about their codebase
Review code with repository context
Generate technical documentation
Generate test cases
Explore large codebases more efficiently

## ⚠️ Limitations

AI-generated results may contain incorrect or incomplete information.

DevForge AI therefore treats AI output as developer assistance rather than a replacement for human review.

Generated code, documentation, reviews, and tests should be reviewed by the developer before being relied upon or executed.

## 👩‍💻 Author

Swarali Suryawanshi

GitHub: https://github.com/Swara888
