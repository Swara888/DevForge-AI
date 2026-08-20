import crypto from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

interface OAuthStateRecord {
  userId: string;
  expiresAt: number;
}

const states = new Map<string, OAuthStateRecord>();

export const createOAuthState = (userId: string): string => {
  const state = crypto.randomBytes(32).toString("hex");

  states.set(state, {
    userId,
    expiresAt: Date.now() + STATE_TTL_MS,
  });

  return state;
};

export const consumeOAuthState = (state: string): string | null => {
  const record = states.get(state);

  if (!record) {
    return null;
  }

  states.delete(state);

  if (record.expiresAt < Date.now()) {
    return null;
  }

  return record.userId;
};