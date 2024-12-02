# Context-Aware Autocomplete Editor

A React-based text editor featuring context-aware autocomplete powered by multiple LLM models (GPT and LLaMA). Built with CKEditor 5 and custom plugins for real-time AI text suggestions.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Dev Setup

1. Configure your environment:

   ```bash
   # .env file
   VITE_API_URL=http://localhost:8000  # Your API endpoint
   ```

## Core Features

### Autocomplete Configuration

- Multiple LLM model support (GPT/LLaMA)
- Adjustable temperature settings
- Configurable trigger frequencies:
  - On key press
  - On word completion
  - On sentence completion
- Ghost text visualization

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Editor**: CKEditor 5 with custom plugins
- **UI**: Tailwind CSS + shadcn/ui
- **Custom Plugins**:
  - `@thesis/ckeditor5-llm-connector`: LLM integration
  - `@thesis/ckeditor5-ghost-text`: Suggestion rendering

## Implementation Details

### LLM Integration

```typescript
// lib/services.ts
export const gptService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/api/gpt/autocomplete`);

export const llamaService = (state: LlmConnectorData) =>
  createAutocompleteService(state, `${API_URL}/api/llama/autocomplete`);
```

### Autocomplete Configuration

```typescript
const autocompleteConfig: LlmConnectorData = {
  frequency: "onWordComplete", // or "onKeyPress", "onSentenceComplete"
  temperature: 80, // 0-100 scale
  model: "gpt", // or "llama"
};
```

### Editor Setup

```tsx
<CKEditor
  editor={ClassicEditor}
  config={{
    plugins: [
      GhostText,
      LLMConnector,
      // Other essential plugins...
    ],
    llmConnector: {
      onParameterSubmit: (data: LlmConnectorData) => {
        // Handle model parameter updates
      },
    },
    ghostText: {
      debounceDelay: 300,
      contentFetcher,
    },
  }}
/>
```

## Project Structure

```
src/
├── components/
│   └── ui/                 # UI components
├── lib/
│   ├── services.ts         # LLM service integrations
│   └── utils.ts            # Helper functions
├── pages/
│   ├── Editor.tsx          # Main editor component
│   └── Login.tsx           # Authentication
└── App.tsx                 # Application routes
```

## Development Notes

### Autocomplete Behavior

The system triggers suggestions based on three modes:

```typescript
export const shouldTriggerAutocomplete = (
  content: string,
  frequency: Frequency
): boolean => {
  switch (frequency) {
    case "onKeyPress":
      return content.includes("[[cursor]]");
    case "onWordComplete":
      return /.\s\[\[cursor\]\]|\n\[\[cursor\]\]/u.test(content);
    case "onSentenceComplete":
      return /[!.?]\s\[\[cursor\]\]/g.test(content);
    default:
      return false;
  }
};
```

### API Integration

- Streaming responses for real-time suggestions
- Token-based authentication
- Error handling for network issues

### State Management

- Editor state managed by CKEditor
- Configuration state using React hooks
- Authentication state in localStorage

### Known Considerations

- Debounce implementation for performance
- Token handling for API requests
- Model switching latency

## Available Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint checks
npm run preview    # Preview build
```
