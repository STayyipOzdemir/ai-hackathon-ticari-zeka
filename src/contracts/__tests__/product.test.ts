import { describe, expect, it } from "vitest";
import { ProductSchema } from "../product";

describe("ProductSchema", () => {
  it("kabul: tam geçerli ürün", () => {
    const r = ProductSchema.safeParse({
      id: "P001",
      title: "Test ürün",
      category: "kirtasiye",
      price: 100,
      cost: 50,
      stock: 10,
      views30d: 200,
      sales30d: 5,
      rating: 4.5,
      reviewCount: 12,
    });
    expect(r.success).toBe(true);
  });

  it("ret: maliyet negatif", () => {
    const r = ProductSchema.safeParse({
      id: "P001",
      title: "Test",
      category: "kirtasiye",
      price: 100,
      cost: -1,
      stock: 10,
      views30d: 0,
      sales30d: 0,
      rating: 4,
      reviewCount: 0,
    });
    expect(r.success).toBe(false);
  });

  it("ret: bilinmeyen kategori", () => {
    const r = ProductSchema.safeParse({
      id: "P001",
      title: "Test",
      category: "olmayan-kategori",
      price: 100,
      cost: 50,
      stock: 10,
      views30d: 0,
      sales30d: 0,
      rating: 4,
      reviewCount: 0,
    });
    expect(r.success).toBe(false);
  });

  it("ret: puan 5'ten büyük", () => {
    const r = ProductSchema.safeParse({
      id: "P001",
      title: "Test",
      category: "elektronik",
      price: 100,
      cost: 50,
      stock: 10,
      views30d: 0,
      sales30d: 0,
      rating: 6,
      reviewCount: 0,
    });
    expect(r.success).toBe(false);
  });
});
