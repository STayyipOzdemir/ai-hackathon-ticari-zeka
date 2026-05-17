import { z } from "zod";
import { CategorySchema } from "./category";

export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  category: CategorySchema,
  price: z.number().positive(),
  cost: z.number().positive(),
  stock: z.number().int().nonnegative(),
  views30d: z.number().int().nonnegative(),
  sales30d: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CatalogSchema = z.array(ProductSchema);
