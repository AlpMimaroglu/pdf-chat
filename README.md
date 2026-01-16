# PDF Chat - Hybrid RAG System

A full-stack conversational Q&A system that combines persistent PDF document knowledge with ephemeral session-based data using Retrieval-Augmented Generation (RAG).

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  TanStack Start  │────▶│   PostgreSQL    │
│   (Chat UI)      │     │  (API Routes)    │     │   (Users/Sessions)│
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌─────────────────┐       ┌─────────────────┐
           │    ChromaDB     │       │   OpenAI API    │
           │  (Vector Store) │       │  (LLM + Embed)  │
           └─────────────────┘       └─────────────────┘
```

## Tech Stack

- **Frontend**: React + TanStack Router
- **Backend**: TanStack Start (Nitro server functions)
- **Database**: PostgreSQL + Drizzle ORM
- **Vector DB**: ChromaDB
- **AI**: Vercel AI SDK + OpenAI (gpt-4o-mini)
- **Auth**: JWT-based authentication

## Features

- ✅ User authentication (register/login with JWT)
- ✅ Session management with ephemeral JSON objects
- ✅ PDF upload and text extraction
- ✅ Document chunking and vector embeddings
- ✅ Hybrid RAG combining documents + session objects
- ✅ Real-time streaming responses
- ✅ Source citations in responses
- ✅ Docker containerization

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- OpenAI API key

### Local Development

1. Clone and install dependencies:
```bash
cd pdf-chat
npm install
```

2. Copy environment file and configure:
```bash
cp .env.example .env.local
# Edit .env.local with your values:
# - OPENAI_API_KEY (required)
# - JWT_SECRET (min 32 chars)
# - DATABASE_URL
# - CHROMA_URL
```

3. Start infrastructure (Postgres + ChromaDB):
```bash
docker-compose up postgres chromadb -d
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

6. Open http://localhost:3000

### Docker Deployment

1. Set environment variables:
```bash
export OPENAI_API_KEY=your-key
export JWT_SECRET=your-secret-min-32-characters-long
```

2. Build and run all services:
```bash
docker-compose up --build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update ephemeral objects
- `DELETE /api/sessions/:id` - Delete session

### Documents
- `GET /api/documents` - List uploaded documents
- `POST /api/documents` - Upload PDF (multipart/form-data)
- `DELETE /api/documents/:id` - Delete document

### Chat
- `POST /api/chat` - Send message (SSE streaming response)
  - Body: `{ sessionId: number, message: string }`

## Project Structure

```
pdf-chat/
├── src/
│   ├── routes/           # TanStack Router pages & API routes
│   │   ├── api/          # API endpoints
│   │   ├── chat.tsx      # Main chat interface
│   │   ├── login.tsx     # Login page
│   │   └── register.tsx  # Registration page
│   ├── lib/              # Shared utilities
│   │   ├── ai.ts         # RAG pipeline & prompts
│   │   ├── api.ts        # Frontend API client
│   │   ├── auth.ts       # JWT utilities
│   │   ├── chroma.ts     # ChromaDB client
│   │   └── pdf.ts        # PDF parsing & chunking
│   ├── db/               # Database schema
│   └── components/       # React components
├── docker-compose.yml    # Container orchestration
├── Dockerfile            # App container
└── drizzle.config.ts     # Drizzle ORM config
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Upload PDFs**: Upload documents to build your knowledge base
3. **Create Session**: Start a new chat session
4. **Add Objects**: Define JSON objects in the sidebar for session-specific context
5. **Chat**: Ask questions that combine document knowledge with your objects

### Example Ephemeral Objects

```json
[
  { "type": "rectangle", "width": 100, "height": 50, "color": "red" },
  { "type": "circle", "radius": 25, "color": "blue" }
]
```

### Example Questions

- "How many objects are in my list?"
- "Do any of my objects violate the size constraints from the uploaded regulations?"
- "Summarize the key points from the uploaded document"
- "Compare the properties of my objects against the specifications"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | Yes |
| `CHROMA_URL` | ChromaDB server URL | No (default: http://localhost:8000) |

## License

MIT
