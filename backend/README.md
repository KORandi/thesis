# AI-Powered Text Autocomplete Backend

A Node.js/Express backend service that provides text autocomplete functionality using both OpenAI's GPT and Ollama's local LLM models. The service processes text with a `[[cursor]]` marker and generates contextually appropriate completions using AI models.

## Features

- Dual model support:
  - OpenAI GPT integration
  - Local Ollama LLM integration
- Streaming response support
- Built-in examples for better context
- CORS configuration for frontend integration
- TypeScript implementation
- Environment variable configuration

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key (for GPT functionality)
- Ollama installed locally (for local LLM functionality)
- TypeScript

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── gpt.ts
│   │   └── llama.ts
│   ├── controllers/
│   │   └── autocompleteController.ts
│   ├── services/
│   │   ├── openAIService.ts
│   │   └── ollamaService.ts
│   ├── data/
│   │   └── examples.ts
│   └── utils/
│       └── loadSystemPrompt.ts
├── prompts/
│   └── systemPrompt.md
└── index.ts
```

## Usage

1. Start the server:
```bash
npm start
```

2. The server will start on `http://localhost:3000` (or the port specified in your .env file)

3. Available endpoints:
   - `/gpt/autocomplete` - OpenAI GPT-based autocomplete
   - `/llama/autocomplete` - Ollama-based autocomplete

4. Send POST requests to either endpoint with the following JSON structure:
```json
{
  "text": "Your text with a [[cursor]] marker"
}
```

## API Documentation

### POST /gpt/autocomplete or /llama/autocomplete

Request body:
```json
{
  "text": "The old castle loomed in the distance, its silhouette [[cursor]] against the setting sun."
}
```

Response:
- Content-Type: text/plain
- Transfer-Encoding: chunked
- Streams the generated completion text

Error Responses:
- 400: Input text must contain [[cursor]]
- 500: Internal server error

## Configuration

The system prompt and example data can be modified in:
- `prompts/systemPrompt.md` - System prompt for AI models
- `src/data/examples.ts` - Training examples for better context

## Development

The project uses nodemon for development, which automatically restarts the server when files are changed:
```bash
npm start
```

## Dependencies

- express: Web framework
- openai: OpenAI API client
- ollama: Ollama API client
- cors: CORS middleware
- dotenv: Environment variable management
- typescript: TypeScript support
- nodemon: Development server
- ts-node: TypeScript execution

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License.
