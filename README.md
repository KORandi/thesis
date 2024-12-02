# Context-Aware Autocomplete Suite

A modern text editor suite that leverages GPT and LLaMA models for intelligent text completion. Built with React, TypeScript, and Express, featuring a sleek UI powered by Tailwind CSS and shadcn/ui components.

## Prerequisites

### Required Software & Accounts

- Node.js 16+ ([Download](https://nodejs.org/))
- Deno ^1.37 (for latency testing tool)

  ```bash
  # macOS/Linux
  curl -fsSL https://deno.land/x/install/install.sh | sh

  # Windows (PowerShell)
  irm https://deno.land/install.ps1 | iex
  ```

- OpenAI API key ([Get API Key](https://platform.openai.com/api-keys))
- Ollama installed and running locally ([Installation Guide](https://ollama.ai/download))
- Git ([Download](https://git-scm.com/downloads))

## Projects Overview

### 1. Context-Aware Autocomplete Editor

Our main React application providing real-time AI suggestions through a customized CKEditor 5 implementation.

[📖 Frontend Documentation](./frontend/README.md)

- **Core Features:**
  - Real-time text completion with ghost text preview
  - Multiple LLM models (GPT/LLaMA) with easy switching
  - Configurable completion triggers (word/sentence/keypress)
  - Modern UI with Tailwind CSS + shadcn/ui
  - Custom CKEditor plugins for LLM integration

### 2. Context-Aware Autocomplete Backend

The Express backend that handles our LLM requests and authentication.

[📖 Backend Documentation](./backend/README.md)

- **Features for Frontend:**
  - Streaming API endpoints for real-time suggestions
  - JWT-based authentication
  - Support for both GPT and LLaMA models
  - Easy-to-use API interface

### 3. LLM Latency Testing Tool

A testing utility that helps us optimize the editor's performance across different LLM endpoints.

[📖 Latency Testing Documentation](./latency-testing/README.md)

## Quick Start

1. **Clone and Install:**

   ```bash
   git clone <repository-url>
   cd thesis
   npm install
   ```

2. **Configure Environment:**

   ```bash
   # Frontend (.env in frontend directory)
   VITE_API_URL=http://localhost:8000

   # Backend (.env in backend directory)
   PORT=8000
   OPENAI_API_KEY=your_key
   JWT_SECRET=your_secret
   ADMIN_PASSWORD=your_password
   OLLAMA_URL=http://127.0.0.1:11434
   ```

3. **Start Development Environment:**
   ```bash
   npm run dev
   ```
   This launches:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## Development Workflow

### Frontend Development

The React application uses Vite for blazing-fast development:

```bash
cd frontend
npm run dev
```

Key files for frontend development:

```
frontend/
├── src/
│   ├── components/    # UI components and editor plugins
│   ├── lib/          # Utilities and API services
│   └── pages/        # Main application pages
```

### Working with the Backend

The backend provides two main endpoints for text completion:

```typescript
// Example API usage
const getCompletion = async (text: string) => {
  const response = await fetch("/api/gpt/autocomplete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      temperature: 0.7,
    }),
  });
  // Handle streaming response
};
```

### Project Structure

```
thesis/
├── frontend/          # Main React application
│   ├── src/          # Source code
│   └── package.json  # Frontend dependencies
├── backend/          # Express API
│   ├── src/         # Backend source
│   └── package.json # Backend dependencies
├── latency-testing/ # Performance testing tool
└── package.json     # Workspace configuration
```

## Available Scripts

```bash
# Root directory
npm run dev          # Start all services

# Frontend directory
npm run dev          # Start Vite dev server
npm run build        # Create production build
npm run preview      # Preview production build

# Backend directory
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start           # Run production server
```
