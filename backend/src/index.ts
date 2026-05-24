import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import env from "./config/env";
import { connectDb } from "./config/db";
import { notFound, errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import studentRoutes from "./routes/studentRoutes";
import parentRoutes from "./routes/parentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import schoolRoutes from "./routes/schoolRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import curriculumRoutes from "./routes/curriculumRoutes";
import questionRoutes from "./routes/questionRoutes";
import testRoutes from "./routes/testRoutes";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/students", studentRoutes);
app.use("/parents", parentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/schools", schoolRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/curriculum", curriculumRoutes);
app.use("/questions", questionRoutes);
app.use("/tests", testRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
