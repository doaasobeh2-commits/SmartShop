import { and, eq, isNull } from "drizzle-orm";
import { config as loadEnv } from "dotenv";
import { env } from "../config.js";
import { db } from "../db/client.js";
import {
  adminUsers,
  appApiKeys,
  appClients,
  auditLogs,
} from "../db/schema/index.js";
import { assertSafeBootstrapPassword } from "../modules/auth/bootstrapSafety.js";
import { createApiKey, hashPassword } from "../modules/auth/crypto.js";

loadEnv();

async function main() {
  assertSafeBootstrapPassword(env.ADMIN_BOOTSTRAP_PASSWORD);

  const email = env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const existingAdmins = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  let adminId = existingAdmins[0]?.id;
  if (!adminId) {
    const passwordHash = await hashPassword(env.ADMIN_BOOTSTRAP_PASSWORD);
    const inserted = await db
      .insert(adminUsers)
      .values({
        email,
        displayName: "fadi.admin",
        role: "owner",
        passwordHash,
      })
      .returning({ id: adminUsers.id });
    adminId = inserted[0]!.id;
    console.log(`Seeded owner admin: ${email}`);
  } else {
    console.log(`Owner admin already exists: ${email}`);
  }

  const apps: Array<{
    appCode: "smartshop" | "recipe" | "fitness";
    name: string;
    scopes: string[];
  }> = [
    {
      appCode: "smartshop",
      name: "SmartShop AI",
      scopes: ["signals:write", "projections:read", "household:read_minimized"],
    },
    {
      appCode: "recipe",
      name: "Recipe AI",
      scopes: ["signals:write", "projections:read", "allergens:read"],
    },
    {
      appCode: "fitness",
      name: "Fitness AI",
      scopes: ["signals:write", "projections:read"],
    },
  ];

  console.log("\n=== APP API KEYS (shown once; store securely) ===");

  for (const app of apps) {
    const existing = await db
      .select()
      .from(appClients)
      .where(eq(appClients.appCode, app.appCode))
      .limit(1);

    let clientId = existing[0]?.id;
    if (!clientId) {
      const inserted = await db
        .insert(appClients)
        .values({
          appCode: app.appCode,
          name: app.name,
          status: "active",
        })
        .returning({ id: appClients.id });
      clientId = inserted[0]!.id;
    }

    const activeKeys = await db
      .select({ id: appApiKeys.id })
      .from(appApiKeys)
      .where(
        and(eq(appApiKeys.appClientId, clientId), isNull(appApiKeys.revokedAt)),
      );

    if (activeKeys.length === 0) {
      const key = createApiKey(app.appCode);
      await db.insert(appApiKeys).values({
        appClientId: clientId,
        keyPrefix: key.prefix,
        keyHash: key.hash,
        scopes: app.scopes,
      });
      console.log(`${app.appCode}: ${key.plaintext}`);
    } else {
      console.log(`${app.appCode}: (existing key retained; not re-printed)`);
    }
  }

  await db.insert(auditLogs).values({
    actorType: "system",
    actorId: "seed",
    action: "system.seed.phase1",
    resourceType: "bootstrap",
    resourceId: adminId,
    metaJson: { apps: apps.map((a) => a.appCode) },
  });

  console.log("\nSeed complete.");
  console.log(
    "Admin credentials come from ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD in .env",
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
