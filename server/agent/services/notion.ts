import { Client } from "@notionhq/client";

export function getNotionClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  return new Client({ auth: token });
}

export async function upsertNote(pageId: string | undefined, markdown: string) {
  const notion = getNotionClient();
  if (!notion) return { pageId: pageId ?? `note_${Math.random().toString(36).slice(2)}`, ok: true };
  if (pageId) {
    await notion.pages.update({ page_id: pageId, properties: {}, archived: false });
    // Basic append as plain text block
    await notion.blocks.children.append({ block_id: pageId, children: [{ paragraph: { rich_text: [{ type: "text", text: { content: markdown } }] } }] });
    return { pageId, ok: true };
  } else {
    const db = process.env.NOTION_DEFAULT_DATABASE_ID;
    if (!db) return { pageId: `note_${Math.random().toString(36).slice(2)}`, ok: true };
    const created = await notion.pages.create({ parent: { database_id: db }, properties: {}, children: [{ paragraph: { rich_text: [{ type: "text", text: { content: markdown } }] } }] });
    return { pageId: created.id, ok: true };
  }
}

