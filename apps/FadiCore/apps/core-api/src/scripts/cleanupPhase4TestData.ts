/**
 * Deletes Phase 4 test users only (hard-coded emails) and cascades
 * sessions/memberships. Also removes orphan households owned by those users.
 *
 * Usage: npm run cleanup:phase4-test
 */
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { config as loadEnv } from "dotenv";
import { db, closeDb } from "../db/client.js";
import {
  householdMembers,
  households,
  userAccounts,
  userSessions,
} from "../db/schema/index.js";

loadEnv();

const TARGET_EMAILS = [
  "p4.mother.mrpcs7js@example.com",
  "p4.father.mrpcs7js@example.com",
  "p4.son.mrpcs7js@example.com",
] as const;

async function main() {
  const users = await db
    .select({
      id: userAccounts.id,
      email: userAccounts.email,
    })
    .from(userAccounts)
    .where(inArray(userAccounts.email, [...TARGET_EMAILS]));

  const userIds = users.map((u) => u.id);
  const deleted = {
    users: [] as string[],
    sessions: [] as string[],
    memberships: [] as string[],
    households: [] as string[],
  };

  if (userIds.length === 0) {
    console.log("No matching Phase 4 test users found.");
    console.log(JSON.stringify(deleted, null, 2));
    await closeDb();
    return;
  }

  const ownedHouseholds = await db
    .select({ id: households.id, ownerUserId: households.ownerUserId })
    .from(households)
    .where(
      and(inArray(households.ownerUserId, userIds), isNull(households.deletedAt)),
    );

  const sessions = await db
    .select({ id: userSessions.id })
    .from(userSessions)
    .where(inArray(userSessions.userId, userIds));
  deleted.sessions = sessions.map((s) => s.id);

  const memberships = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(inArray(householdMembers.userId, userIds));
  deleted.memberships = memberships.map((m) => m.id);

  // Remove memberships for these users first
  if (memberships.length > 0) {
    await db
      .delete(householdMembers)
      .where(inArray(householdMembers.id, deleted.memberships));
  }

  // Delete sessions
  if (sessions.length > 0) {
    await db
      .delete(userSessions)
      .where(inArray(userSessions.id, deleted.sessions));
  }

  // Orphan households: owned by target users and empty / no other active members
  for (const hh of ownedHouseholds) {
    const remaining = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.householdId, hh.id),
          eq(householdMembers.status, "active"),
        ),
      );
    const count = remaining[0]?.c ?? 0;
    if (count === 0) {
      await db.delete(households).where(eq(households.id, hh.id));
      deleted.households.push(hh.id);
    }
  }

  // Clear owner refs then delete users
  await db
    .update(households)
    .set({ ownerUserId: null })
    .where(inArray(households.ownerUserId, userIds));

  await db.delete(userAccounts).where(inArray(userAccounts.id, userIds));
  deleted.users = userIds;

  console.log("Phase 4 test cleanup complete:");
  console.log(JSON.stringify({ matchedEmails: users.map((u) => u.email), deleted }, null, 2));
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb().catch(() => undefined);
  process.exit(1);
});
