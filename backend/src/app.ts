import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes"
import authRoutes from "./routes/auth.routes"
import sessionRoutes from "./routes/session.routes";

import sourceRoutes from "./routes/source.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to KnowLink AI API",
  });
});
app.use("/api/health",healthRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sources", sourceRoutes);

export default app;