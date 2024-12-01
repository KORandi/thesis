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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Authentication Error:", error);
    throw error;
  }
}

async function testGPTEndpoint(
  text: string,
  token: string
): Promise<{ totalTime: number; firstTokenTime: number; totalTokens: number }> {
  const startTime = performance.now();
  let firstTokenTime = 0;
  let totalTokens = 0;

  try {
    const response = await fetch(`${API_URL}/api/gpt/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text,
        temperature: 0.7,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    let firstToken = true;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (firstToken) {
        firstTokenTime = performance.now() - startTime;
        firstToken = false;
      }
      totalTokens += 1;
    }

    return {
      totalTime: performance.now() - startTime,
      firstTokenTime,
      totalTokens,
    };
  } catch (error) {
    console.error("GPT Endpoint Error:", error);
    throw error;
  }
}

async function testLlamaEndpoint(
  text: string,
  token: string
): Promise<{ totalTime: number; firstTokenTime: number; totalTokens: number }> {
  const startTime = performance.now();
  let firstTokenTime = 0;
  let totalTokens = 0;

  try {
    const response = await fetch(`${API_URL}/api/llama/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text,
        temperature: 0.7,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    let firstToken = true;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (firstToken) {
        firstTokenTime = performance.now() - startTime;
        firstToken = false;
      }
      totalTokens += 1;
    }

    return {
      totalTime: performance.now() - startTime,
      firstTokenTime,
      totalTokens,
    };
  } catch (error) {
    console.error("Llama Endpoint Error:", error);
    throw error;
  }
}

async function runLatencyTests(token: string) {
  const results: LatencyResult[] = [];
  const timestamp = new Date().toISOString();

  for (const prompt of testPrompts) {
    console.log(`Testing prompt: ${prompt.substring(0, 50)}...`);
    try {
      const gptResults = await testGPTEndpoint(prompt, token);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const llamaResults = await testLlamaEndpoint(prompt, token);

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

      await new Promise((resolve) => setTimeout(resolve, 2000));
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

function exportToFiles(results: LatencyResult[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsDir = "./results";

  try {
    Deno.mkdirSync(resultsDir);
  } catch {
    // Directory might already exist
  }

  const jsonPath = `${resultsDir}/latency_results_${timestamp}.json`;
  Deno.writeTextFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`JSON results exported to: ${jsonPath}`);

  const csvPath = `${resultsDir}/latency_results_${timestamp}.csv`;
  const csvHeader =
    "Timestamp,Prompt,GPT Latency,GPT First Token,GPT Total Tokens,Llama Latency,Llama First Token,Llama Total Tokens,Difference,Error\n";
  const csvContent = results
    .map(
      (result) =>
        `"${result.timestamp}","${result.prompt.replace(/"/g, '""')}",${
          result.gptLatency
        },${result.gptFirstTokenTime},${result.gptTotalTokens},${
          result.llamaLatency
        },${result.llamaFirstTokenTime},${result.llamaTotalTokens},${
          result.difference
        },"${result.error || ""}"`
    )
    .join("\n");

  Deno.writeTextFileSync(csvPath, csvHeader + csvContent);
  console.log(`CSV results exported to: ${csvPath}`);

  const summaryPath = `${resultsDir}/summary_${timestamp}.txt`;
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
Average Latency: ${(
    successfulTests.reduce((sum, r) => sum + r.gptLatency, 0) /
    successfulTests.length
  ).toFixed(2)}ms
Min Latency: ${Math.min(...successfulTests.map((r) => r.gptLatency)).toFixed(
    2
  )}ms
Max Latency: ${Math.max(...successfulTests.map((r) => r.gptLatency)).toFixed(
    2
  )}ms
Average First Token Time: ${(
    successfulTests.reduce((sum, r) => sum + r.gptFirstTokenTime, 0) /
    successfulTests.length
  ).toFixed(2)}ms
Average Total Tokens: ${(
    successfulTests.reduce((sum, r) => sum + r.gptTotalTokens, 0) /
    successfulTests.length
  ).toFixed(1)}

Llama Statistics
---------------
Average Latency: ${(
    successfulTests.reduce((sum, r) => sum + r.llamaLatency, 0) /
    successfulTests.length
  ).toFixed(2)}ms
Min Latency: ${Math.min(...successfulTests.map((r) => r.llamaLatency)).toFixed(
    2
  )}ms
Max Latency: ${Math.max(...successfulTests.map((r) => r.llamaLatency)).toFixed(
    2
  )}ms
Average First Token Time: ${(
    successfulTests.reduce((sum, r) => sum + r.llamaFirstTokenTime, 0) /
    successfulTests.length
  ).toFixed(2)}ms
Average Total Tokens: ${(
    successfulTests.reduce((sum, r) => sum + r.llamaTotalTokens, 0) /
    successfulTests.length
  ).toFixed(1)}

Comparison
----------
Average Latency Difference: ${(
    successfulTests.reduce((sum, r) => sum + r.difference, 0) /
    successfulTests.length
  ).toFixed(2)}ms
Average First Token Time Difference: ${(
    successfulTests.reduce(
      (sum, r) => sum + (r.gptFirstTokenTime - r.llamaFirstTokenTime),
      0
    ) / successfulTests.length
  ).toFixed(2)}ms
Average Total Tokens Difference: ${(
    successfulTests.reduce(
      (sum, r) => sum + (r.gptTotalTokens - r.llamaTotalTokens),
      0
    ) / successfulTests.length
  ).toFixed(1)}
`.trim();

  Deno.writeTextFileSync(summaryPath, summary);
  console.log(`Summary exported to: ${summaryPath}`);
}

async function main() {
  try {
    console.log("Authenticating...");
    const token = await authenticate(
      env["USERNAME"] || "",
      env["PASSWORD"] || ""
    );
    console.log("Authentication successful");

    console.log("Starting backend latency tests...");
    const results = await runLatencyTests(token);
    exportToFiles(results);
    console.log("Testing completed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main().catch(console.error);
