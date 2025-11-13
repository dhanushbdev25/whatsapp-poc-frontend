export interface Product {
  id: number;
  name: string;
  productType: string;
  productCode: string;
  amount: string | number;
  loyaltyPoints: number;
  image?: string;
  metadata?: string;
  contentId?: string;
  productName?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  warrantyPeriod?: string;
  returnPeriodDays?: string;
  qty?: number;
  currency?: string;
  categorytype?: string;
  points?: number;
}
