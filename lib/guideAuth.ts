/**
 * Guide Authentication Helpers
 * 
 * PROTOTYPE-ONLY AUTH: This is a simple dev/preview auth system.
 * It should be replaced with a proper auth solution (e.g., NextAuth, Clerk)
 * before production deployment.
 */

import bcrypt from "bcryptjs";
import type { GuideAccount, GuideAccountDataset } from "@/lib/types";
import rawGuides from "@/data/guides.json";

const guidesData = rawGuides as GuideAccountDataset;

/**
 * Find a guide account by username
 */
export function getGuideByUsername(username: string): GuideAccount | undefined {
  return guidesData.guides.find(
    (g) => g.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Find a guide account by ID
 */
export function getGuideById(id: string): GuideAccount | undefined {
  return guidesData.guides.find((g) => g.id === id);
}

/**
 * Get all guide accounts (for admin purposes)
 */
export function getAllGuides(): GuideAccount[] {
  return guidesData.guides;
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch {
    return false;
  }
}

/**
 * Hash a password (for creating new accounts)
 * Only used in development for seeding accounts
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

