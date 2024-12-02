# Context-Aware Autocomplete Backend

A TypeScript/Express backend service that processes text input with a `[[cursor]]` marker to generate contextually relevant completions using GPT and Llama models.

## Prerequisites

1. Node.js 16+
2. OpenAI API key
3. Ollama installed and running locally

## Tech Stack

- Node.js/Express
- TypeScript
- OpenAI API (GPT-4o-mini)
- Ollama (Llama 3.2)
- JWT Authentication
- Streaming Responses

## Setup

Install dependencies:

```bash
npm install
```

Configure environment:

```env
PORT=8000
NODE_ENV=development
OPENAI_API_KEY=your_key
JWT_SECRET=your_secret
ADMIN_PASSWORD=your_password
OLLAMA_URL=http://127.0.0.1:11434
```

## API Endpoints

### Authentication

```
POST /api/auth/login
Body: { username: string, password: string }
Returns: { token: string }
```

### Text Completion

```
POST /api/gpt/autocomplete
POST /api/llama/autocomplete
Headers: Authorization: Bearer <token>
Body: {
  text: string (with [[cursor]] marker),
  temperature: number (0-1)
}
Returns: Streamed completion text
```

## Core Functions

- Context extraction (500 chars around cursor)
- Streaming response handling
- Model-agnostic architecture
- JWT-based route protection
- Error handling with appropriate status codes

## Development

```bash
npm run dev     # Development with hot-reload
npm run build   # Compile TypeScript
npm start       # Production server
```

## Error Handling

- 400: Invalid input (missing cursor, invalid temperature)
- 401: Authentication failures
- 500: Server errors

## Type Definitions

Key interfaces available in `types.d.ts`. Services implement standardized stream handling for both GPT and Llama models.

## Architecture

```
src/
  ├── api/          # Route definitions
  ├── controllers/  # Request handling
  ├── services/     # Model implementations
  ├── middlewares/  # Auth, validation
  ├── utils/        # Helpers
  └── data/         # Training examples
```

## Notes

- Default port: 8000
- Development CORS: all origins
- JWT expiry: 24h
- Cursor marker: [[cursor]]
- Context window: 500 chars
