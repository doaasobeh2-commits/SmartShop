import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  platformApplications,
  type ApplicationScope,
  type PlatformApplicationKey,
} from "../../db/schema/index.js";
import { loadActiveMembershipForUser } from "../../middleware/requireHouseholdAccess.js";

export type AppIdentity = {
  scope: ApplicationScope;
  householdId: string | null;
  memberId: string | null;
};

export async function resolveAppIdentity(input: {
  userId: string;
  applicationKey: string;
}): Promise<
  | { ok: true; identity: AppIdentity }
  | { ok: false; reason: "invalid_application" }
> {
  const apps = await db
    .select({
      key: platformApplications.key,
      scope: platformApplications.scope,
    })
    .from(platformApplications)
    .where(eq(platformApplications.key, input.applicationKey as PlatformApplicationKey))
    .limit(1);

  const app = apps[0];
  if (!app) {
    return { ok: false, reason: "invalid_application" };
  }

  const membership = await loadActiveMembershipForUser(input.userId);

  if (app.scope === "household") {
    return {
      ok: true,
      identity: {
        scope: "household",
        householdId: membership?.householdId ?? null,
        memberId: membership?.memberId ?? null,
      },
    };
  }

  // member-scoped apps (e.g. fitness)
  return {
    ok: true,
    identity: {
      scope: "member",
      householdId: membership?.householdId ?? null,
      memberId: membership?.memberId ?? null,
    },
  };
}
