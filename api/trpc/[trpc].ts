import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Mount at /api/trpc so tRPC strips the prefix correctly.
// Vercel passes the full URL (e.g. /api/trpc/auth.me) to this function,
// so the mount path must match the prefix for tRPC to see "auth.me" not "api/trpc/auth.me".
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
