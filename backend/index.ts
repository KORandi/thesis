import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
export const app = express();
app.use(express.json());
import gpt from "./src/api/gpt";
import llama from "./src/api/llama";

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"], // Specify the methods you want to allow
    credentials: true, // Include if you are using cookies or Authorization headers
  })
);

const PORT = process.env.PORT || 3000;

app.use("/gpt", gpt);
app.use("/llama", llama);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;
