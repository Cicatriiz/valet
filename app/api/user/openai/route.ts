import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/db";
import { encryptToString, decryptFromString } from "@/lib/crypto";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const secret = await prisma.secret.findUnique({ where: { userId_key: { userId, key: "OPENAI_API_KEY" } } });
  const exists = Boolean(secret);
  return Response.json({ exists });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const schema = z.object({ apiKey: z.string().min(20) });
  const { apiKey } = schema.parse(body);
  const encrypted = encryptToString(apiKey);
  await prisma.secret.upsert({
    where: { userId_key: { userId, key: "OPENAI_API_KEY" } },
    create: { userId, key: "OPENAI_API_KEY", value: encrypted },
    update: { value: encrypted },
  });
  return Response.json({ ok: true });
}

