import { groceries_build_cart } from "@/server/agent/tools/groceries";
import { describe, it, expect } from "vitest";

describe("groceries_build_cart", () => {
  it("maps common items with mock prices and calculates subtotal", async () => {
    const res: any = await groceries_build_cart.handler(
      { provider: "demo", items: [
        { name: "milk", qty: 2 },
        { name: "eggs", qty: 1 },
        { name: "bread", qty: 3 },
        { name: "chicken", qty: 1 },
        { name: "rice", qty: 1 },
        { name: "pasta", qty: 2 },
        { name: "apples", qty: 4 },
        { name: "bananas", qty: 5 },
        { name: "coffee", qty: 1 },
        { name: "yogurt", qty: 1 },
      ] },
      { userId: null }
    );
    expect(res.items.length).toBe(10);
    expect(res.subtotal).toBeGreaterThan(0);
    expect(res.cartId).toContain("cart_");
  });
});
