import { load } from "https://deno.land/std/dotenv/mod.ts";
import testPrompts from "./prompts.ts";

const env = await load();
const API_URL =
  Deno.env.get("API_URL") || env["API_URL"] || "http://localhost:8000";

interface LatencyResult {
  prompt: string;
  gptLatency: number;
  llamaLatency: number;
  gptFirstTokenTime: number;
  llamaFirstTokenTime: number;
  gptTotalTokens: number;
  llamaTotalTokens: number;
  error?: string;
  timestamp: string;
  difference: number;
}

async function authenticate(
  username: string,
  password: string
): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error("Authentication failed");

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Authentication Error:", error);
    throw error;
  }
}

async function testEndpoint(
  endpoint: string,
  text: string,
  token: string
): Promise<{ totalTime: number; firstTokenTime: number; totalTokens: number }> {
  const startTime = performance.now();
  let firstTokenTime = 0;
  let totalTokens = 0;

  try {
    const response = await fetch(`${API_URL}/api/${endpoint}/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, temperature: 0.7 }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response reader available");

    let isFirstToken = true;
    while (true) {
      const { done } = await reader.read();
      if (done) break;

      if (isFirstToken) {
        firstTokenTime = performance.now() - startTime;
        isFirstToken = false;
      }
      totalTokens++;
    }

    return {
      totalTime: performance.now() - startTime,
      firstTokenTime,
      totalTokens,
    };
  } catch (error) {
    console.error(`${endpoint} Endpoint Error:`, error);
    throw error;
  }
}

async function runLatencyTests(token: string): Promise<LatencyResult[]> {
  const results: LatencyResult[] = [];
  const timestamp = new Date().toISOString();

  for (const prompt of testPrompts) {
    console.log(`Testing prompt: ${prompt.substring(0, 50)}...`);
    try {
      const gptResults = await testEndpoint("gpt", prompt, token);
      await delay(1000);
      const llamaResults = await testEndpoint("llama", prompt, token);

      results.push({
        prompt,
        gptLatency: gptResults.totalTime,
        llamaLatency: llamaResults.totalTime,
        gptFirstTokenTime: gptResults.firstTokenTime,
        llamaFirstTokenTime: llamaResults.firstTokenTime,
        gptTotalTokens: gptResults.totalTokens,
        llamaTotalTokens: llamaResults.totalTokens,
        timestamp,
        difference: gptResults.totalTime - llamaResults.totalTime,
      });

      await delay(2000);
    } catch (error) {
      results.push({
        prompt,
        gptLatency: 0,
        llamaLatency: 0,
        gptFirstTokenTime: 0,
        llamaFirstTokenTime: 0,
        gptTotalTokens: 0,
        llamaTotalTokens: 0,
        error: error.message,
        timestamp,
        difference: 0,
      });
    }
  }

  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exportResults(results: LatencyResult[]): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsDir = "./results";

  ensureDirectory(resultsDir);

  writeJSON(results, `${resultsDir}/latency_results_${timestamp}.json`);
  writeCSV(results, `${resultsDir}/latency_results_${timestamp}.csv`);
  writeSummary(results, `${resultsDir}/summary_${timestamp}.txt`);
}

function ensureDirectory(path: string): void {
  try {
    Deno.mkdirSync(path);
  } catch {}
}

function writeJSON(results: LatencyResult[], path: string): void {
  Deno.writeTextFileSync(path, JSON.stringify(results, null, 2));
  console.log(`JSON results exported to: ${path}`);
}

function writeCSV(results: LatencyResult[], path: string): void {
  const csvHeader =
    "Timestamp,Prompt,GPT Latency,GPT First Token,GPT Total Tokens,Llama Latency,Llama First Token,Llama Total Tokens,Difference,Error\n";
  const csvRows = results.map((result) =>
    [
      result.timestamp,
      `"${result.prompt.replace(/"/g, '""')}"`,
      result.gptLatency,
      result.gptFirstTokenTime,
      result.gptTotalTokens,
      result.llamaLatency,
      result.llamaFirstTokenTime,
      result.llamaTotalTokens,
      result.difference,
      `"${result.error || ""}"`,
    ].join(",")
  );
  Deno.writeTextFileSync(path, csvHeader + csvRows.join("\n"));
  console.log(`CSV results exported to: ${path}`);
}

function writeSummary(results: LatencyResult[], path: string): void {
  const successfulTests = results.filter((r) => !r.error);

  const summary = `
Latency Test Summary
===================
Test Date: ${new Date().toISOString()}
Total Tests: ${results.length}
Successful Tests: ${successfulTests.length}
Failed Tests: ${results.length - successfulTests.length}

GPT Statistics
-------------
${getStatistics(successfulTests, "gpt")}

Llama Statistics
---------------
${getStatistics(successfulTests, "llama")}

Comparison
----------
Average Latency Difference: ${getAverage(
    successfulTests.map((r) => r.difference)
  )}ms
  `.trim();

  Deno.writeTextFileSync(path, summary);
  console.log(`Summary exported to: ${path}`);
}

function getStatistics(
  results: LatencyResult[],
  model: "gpt" | "llama"
): string {
  const latency = results.map((r) => r[`${model}Latency`]);
  const firstToken = results.map((r) => r[`${model}FirstTokenTime`]);
  const totalTokens = results.map((r) => r[`${model}TotalTokens`]);

  return `
Average Latency: ${getAverage(latency)}ms
Min Latency: ${Math.min(...latency).toFixed(2)}ms
Max Latency: ${Math.max(...latency).toFixed(2)}ms
Average First Token Time: ${getAverage(firstToken)}ms
Average Total Tokens: ${getAverage(totalTokens)}
  `.trim();
}

function getAverage(numbers: number[]): string {
  return (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(
    2
  );
}

async function main() {
  try {
    console.log("Authenticating...");
    const token = await authenticate(
      env["USERNAME"] || "",
      env["PASSWORD"] || ""
    );
    console.log("Authentication successful");

    console.log("Starting latency tests...");
    const results = await runLatencyTests(token);

    exportResults(results);
    console.log("Testing completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main().catch(console.error);
