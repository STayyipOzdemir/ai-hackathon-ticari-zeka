/**
 * Geriye dönük uyumluluk için re-export. Tüm tipler artık `src/contracts/`
 * altındaki Zod şemalarından türetilir.
 *
 * Yeni kodda `import { Product, Category, ... } from "@/contracts"` kullan.
 */
export * from "@/contracts";
