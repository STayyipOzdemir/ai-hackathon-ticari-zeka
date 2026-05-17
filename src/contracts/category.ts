import { z } from "zod";

export const CATEGORY_VALUES = [
  "kirtasiye",
  "elektronik",
  "moda-kadin",
  "moda-erkek",
  "ev-yasam",
  "kozmetik",
  "spor",
  "anne-bebek",
  "kitap",
  "supermarket",
] as const;

export const CategorySchema = z.enum(CATEGORY_VALUES);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  kirtasiye: "Kırtasiye",
  elektronik: "Elektronik",
  "moda-kadin": "Kadın Giyim",
  "moda-erkek": "Erkek Giyim",
  "ev-yasam": "Ev & Yaşam",
  kozmetik: "Kozmetik",
  spor: "Spor & Outdoor",
  "anne-bebek": "Anne & Bebek",
  kitap: "Kitap",
  supermarket: "Süpermarket",
};

export const CompetitionSchema = z.enum(["dusuk", "orta", "yuksek"]);
export type Competition = z.infer<typeof CompetitionSchema>;
