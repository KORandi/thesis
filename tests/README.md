# LLM Latency Testing Tool

A specialized testing tool built with Deno to compare response latencies between GPT and Llama model endpoints. The tool measures total response time, first token latency, and token counts across various prompt types, helping developers optimize their LLM implementations.

## Features

- Testing of GPT and Llama endpoints
- Multiple performance metrics:
  - Total response latency
  - First token response time
  - Total tokens generated
- 80+ test prompts across different categories
- Multiple export formats (JSON, CSV, and summary text)
- Built-in authentication support
- Configurable via environment variables

## Prerequisites

### Required Software

- **Deno**: ^1.37 or higher

  ```bash
  # macOS/Linux
  curl -fsSL https://deno.land/x/install/install.sh | sh

  # Windows (PowerShell)
  irm https://deno.land/install.ps1 | iex
  ```

### API Access

- Access tokens for GPT and Llama API endpoints
- Valid authentication credentials
- Backend service running and accessible

## Installation

1. Clone the repository
2. Create `.env` file with required variables
3. Run the setup check:

```bash
deno task start --check
```

### Setup

1. Create `.env` file in project root:

   ```env
   API_URL=your_api_endpoint
   USERNAME=your_username
   PASSWORD=your_password
   ```

## Usage

Run the latency tests:

```bash
deno task start
```

This will:

1. Authenticate with the API
2. Execute tests against both endpoints
3. Generate results in the `./results` directory

## Output Files

The tool generates three types of output in `./results/`:

1. `latency_results_[timestamp].json` - Complete test results in JSON
2. `latency_results_[timestamp].csv` - Spreadsheet-friendly format
3. `summary_[timestamp].txt` - Human-readable statistics

## Test Categories

Includes diverse prompt types:

- Creative Writing
- Business Writing
- Technical Writing
- Academic Writing
- Descriptive Scenarios
- Professional Emails
- Project Documentation
- Error Scenarios
- Feature Descriptions
- And more...

## Implementation Details

### Key Components

- `latencyTest.ts` - Main test runner
- `prompts.ts` - Test prompt library
- `deno.json` - Project configuration

### Statistics Generated

For both models:

- Average/min/max latency
- First token timing
- Total tokens generated
- Comparative analysis
- Success/failure rates

### Error Handling

- API failure handling
- Detailed error logging
- Failed test tracking
- Automatic retry mechanism

## Development

```bash
# Format code
deno fmt

# Run with watch mode
deno task start --watch
```
