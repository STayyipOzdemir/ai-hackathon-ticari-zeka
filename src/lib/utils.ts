import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const TRY_PRECISE = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

const PCT = new Intl.NumberFormat("tr-TR", {
  style: "percent",
  maximumFractionDigits: 1,
});

const NUM = new Intl.NumberFormat("tr-TR");

export const fmtTRY = (n: number) => TRY.format(Math.round(n));
export const fmtTRYPrecise = (n: number) => TRY_PRECISE.format(n);
export const fmtPct = (n: number) => PCT.format(n);
export const fmtNum = (n: number) => NUM.format(Math.round(n));
