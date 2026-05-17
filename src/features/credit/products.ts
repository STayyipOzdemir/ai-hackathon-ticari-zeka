/**
 * Türk bankalarının KOBİ/esnaf kredisi ürünleri (Mayıs 2026 referans).
 * Demo amaçlıdır; gerçek faiz oranları piyasaya göre değişir.
 * Kullanıcı kararını gerçek başvuru ile doğrulamalı.
 */

export interface CreditProduct {
  id: string;
  bank: string;
  name: string;
  /** Aylık faiz, ondalık (0.025 = %2.5) */
  monthlyRate: number;
  /** Maksimum vade (ay) */
  maxTermMonths: number;
  /** Maksimum tutar */
  maxAmount: number;
  /** Minimum tutar */
  minAmount: number;
  /** Notlar */
  note: string;
}

export const CREDIT_PRODUCTS: CreditProduct[] = [
  {
    id: "vakif-esnaf",
    bank: "Vakıfbank",
    name: "Esnaf Destek Kredisi",
    monthlyRate: 0.035,
    maxTermMonths: 12,
    maxAmount: 100000,
    minAmount: 1000,
    note: "Esnaf ve sanatkar siciline kayıtlı işletmeler için. Hızlı onay.",
  },
  {
    id: "akbank-kobi",
    bank: "Akbank",
    name: "KOBİ Hızlı Kredi",
    monthlyRate: 0.038,
    maxTermMonths: 18,
    maxAmount: 250000,
    minAmount: 5000,
    note: "12 ayı aşan vadelerde teminat istenir.",
  },
  {
    id: "garanti-pos",
    bank: "Garanti BBVA",
    name: "Bonus POS Kredisi",
    monthlyRate: 0.032,
    maxTermMonths: 9,
    maxAmount: 75000,
    minAmount: 1000,
    note: "Garanti POS cirosuna göre limit belirlenir. POS cirosu yoksa uygulanmaz.",
  },
  {
    id: "ziraat-isletme",
    bank: "Ziraat Bankası",
    name: "İşletme Kredisi",
    monthlyRate: 0.029,
    maxTermMonths: 24,
    maxAmount: 500000,
    minAmount: 10000,
    note: "Devlet bankası, en düşük faiz ama onay süresi 3-7 gün.",
  },
];
