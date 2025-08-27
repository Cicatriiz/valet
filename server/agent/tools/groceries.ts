import { z } from "zod";
import type { ToolDef } from "./index";
import { registerTool } from "./index";
import { createPendingApproval } from "@/server/agent/approvals";

const itemSchema = z.object({ name: z.string(), qty: z.number().min(1).default(1), notes: z.string().optional() });

export const groceriesBuildCartInput = z.object({ provider: z.string().default("demo"), items: z.array(itemSchema), deliveryWindow: z.string().optional() });
export const groceriesBuildCartOutput = z.object({ cartId: z.string(), items: z.array(z.object({ name: z.string(), qty: z.number(), price: z.number() })), subtotal: z.number(), link: z.string().optional() });

export const groceriesCheckoutInput = z.object({ cartId: z.string() });
export const groceriesCheckoutOutput = z.object({ ok: z.boolean(), orderId: z.string().optional() });

export const groceriesLinkInput = z.object({ cartId: z.string() });
export const groceriesLinkOutput = z.object({ url: z.string() });

const demoCatalog: Record<string, number> = {
  "milk": 3.5,
  "eggs": 4.0,
  "bread": 2.5,
  "chicken": 9.99,
  "rice": 5.25,
  "pasta": 2.1,
  "apples": 4.75,
  "bananas": 1.99,
  "coffee": 7.5,
  "yogurt": 6.0,
};

const groceries_build_cart: ToolDef = {
  name: "groceries_build_cart",
  input: groceriesBuildCartInput,
  output: groceriesBuildCartOutput,
  async handler(args) {
    const input = groceriesBuildCartInput.parse(args);
    const items = input.items.map((i) => ({ name: i.name, qty: i.qty, price: (demoCatalog[i.name.toLowerCase()] ?? 5) * i.qty }));
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const cartId = `cart_${Math.random().toString(36).slice(2)}`;
    const link = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/groceries/${cartId}`;
    return { cartId, items, subtotal, link };
  },
};

const groceries_checkout: ToolDef = {
  name: "groceries_checkout",
  requiresApproval: true,
  input: groceriesCheckoutInput,
  output: groceriesCheckoutOutput,
  async handler(args, ctx) {
    const input = groceriesCheckoutInput.parse(args);
    await createPendingApproval({
      userId: ctx.userId,
      toolName: "groceries_checkout",
      title: "Checkout Groceries",
      summary: `Checkout cart ${input.cartId}`,
      payload: input,
    });
    return { ok: false };
  },
};

const groceries_link: ToolDef = {
  name: "groceries_link",
  input: groceriesLinkInput,
  output: groceriesLinkOutput,
  async handler(args) {
    const input = groceriesLinkInput.parse(args);
    const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/groceries/${input.cartId}`;
    return { url };
  },
};

registerTool(groceries_build_cart);
registerTool(groceries_checkout);
registerTool(groceries_link);

export { groceries_build_cart, groceries_checkout, groceries_link };

