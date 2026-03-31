import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  // Dev-only login bypass — creates a test admin user automatically
  if (process.env.NODE_ENV === "development") {
    app.get("/api/dev-login", async (req: Request, res: Response) => {
      const devOpenId = process.env.OWNER_OPEN_ID || "dev@stratix.ai";
      const devName = "Developer";

      await db.upsertUser({
        openId: devOpenId,
        name: devName,
        email: devOpenId,
        loginMethod: "dev",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(devOpenId, {
        name: devName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const returnPath =
        typeof req.query.returnPath === "string"
          ? req.query.returnPath
          : "/dashboard";
      res.redirect(302, returnPath);
    });
  }
}
