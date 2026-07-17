import { randomBytes } from "node:crypto";
import { db, type Db } from "../db/client.js";
import { auditLogs, type ActorType } from "../db/schema/index.js";

type AuditExecutor = Pick<Db, "insert">;

export async function writeAudit(
  input: {
    actorType: ActorType;
    actorId?: string | null;
    action: string;
    resourceType?: string | null;
    resourceId?: string | null;
    metaJson?: Record<string, unknown>;
    ip?: string | null;
  },
  executor: AuditExecutor = db,
): Promise<void> {
  await executor.insert(auditLogs).values({
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId ?? null,
    metaJson: input.metaJson ?? {},
    ip: input.ip ?? null,
  });
}

export function createPublicAlias(): string {
  return `HH-${randomBytes(4).toString("hex")}`;
}

export function createInviteToken(): string {
  return randomBytes(32).toString("base64url");
}
