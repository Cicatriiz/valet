import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/db";
import { encryptToString } from "@/lib/crypto";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (userId) {
    const secret = await prisma.secret.findUnique({ where: { userId_key: { userId, key: "OPENAI_API_KEY" } } });
    return Response.json({ exists: Boolean(secret) });
  }
  const cookie = req.cookies.get("valet_openai")?.value;
  return Response.json({ exists: Boolean(cookie) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const body = await req.json();
  const schema = z.object({ apiKey: z.string().min(20) });
  const { apiKey } = schema.parse(body);
  const hasEnc = (process.env.ENCRYPTION_KEY ?? "").length >= 32;
  if (userId) {
    if (!hasEnc) {
      return new Response("Server missing ENCRYPTION_KEY (>=32 chars)", { status: 500 });
    }
    const encrypted = encryptToString(apiKey);
    await prisma.secret.upsert({
      where: { userId_key: { userId, key: "OPENAI_API_KEY" } },
      create: { userId, key: "OPENAI_API_KEY", value: encrypted },
      update: { value: encrypted },
    });
    return Response.json({ ok: true });
  }
  const res = NextResponse.json({ ok: true });
  const cookieVal = hasEnc ? encryptToString(apiKey) : `plain:${apiKey}`;
  res.cookies.set("valet_openai", cookieVal, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (userId) {
    await prisma.secret.deleteMany({ where: { userId, key: "OPENAI_API_KEY" } });
    return Response.json({ ok: true });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("valet_openai", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}

