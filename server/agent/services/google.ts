import prisma from "@/lib/db";
import { google } from "googleapis";

async function refreshIfNeeded(accountId: string, tokens: { access_token: string | null; refresh_token: string | null; expiry_date?: number | null; scope?: string | null }) {
  const now = Date.now();
  const expiresAt = (tokens as any).expires_at as number | undefined;
  if (!expiresAt || expiresAt - now > 60_000) return tokens.access_token; // still valid or unknown
  if (!tokens.refresh_token) return tokens.access_token; // cannot refresh
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ refresh_token: tokens.refresh_token });
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    await prisma.account.update({ where: { id: accountId }, data: { access_token: credentials.access_token ?? null, expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null, scope: credentials.scope ?? null } as any });
    return credentials.access_token ?? tokens.access_token;
  } catch {
    return tokens.access_token;
  }
}

async function getAccessTokenForUser(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: "google" }, orderBy: { id: "desc" } });
  if (!account) return null;
  const access = await refreshIfNeeded(account.id, { access_token: account.access_token, refresh_token: (account as any).refresh_token ?? null, expiry_date: account.expires_at ? account.expires_at * 1000 : undefined, scope: (account as any).scope ?? null });
  return access ?? null;
}

export async function getGmailClient(userId: string) {
  const accessToken = await getAccessTokenForUser(userId);
  if (!accessToken) return null;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function getCalendarClient(userId: string) {
  const accessToken = await getAccessTokenForUser(userId);
  if (!accessToken) return null;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

