import prisma from "@/lib/db";
import { google } from "googleapis";

async function getAccessTokenForUser(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: "google" }, orderBy: { id: "desc" } });
  return account?.access_token ?? null;
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

