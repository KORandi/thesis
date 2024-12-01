import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
export const app = express();
app.use(express.json());
import gpt from "./src/api/gpt";
import llama from "./src/api/llama";
const path = require("path");

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
}

const PORT = process.env.PORT || 8000;

app.use("/api/gpt", gpt);
app.use("/api/llama", llama);
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;
