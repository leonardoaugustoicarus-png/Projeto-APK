
export enum ProductStatus {
  EXPIRED = 'Vencido',
  CRITICAL = 'Crítico (<= 35 dias)',
  SAFE = 'Seguro (> 35 dias)'
}

export interface Product {
  id: string;
  barcode: string;
  batch?: string;
  name: string;
  quantity: number;
  expiryDate: string;
  observations: string;
  daysToExpiry: number;
  status: ProductStatus;
}

export interface InventoryStats {
  total: number;
  expired: number;
  critical: number;
  safe: number;
}
