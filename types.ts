
export enum RiskLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export type SupplierCategory = 'Electronics' | 'Raw Materials' | 'Logistics' | 'Manufacturing' | 'Textiles' | 'Food & Beverage';

export interface CompanyInfo {
  name: string;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  category: SupplierCategory;
  registeredAt: string;
}

export interface MapInsight {
  summary: string;
  nearbyInfrastructure: string;
  links: { title: string; uri: string }[];
}

export interface RiskAnalysis {
  supplierId: string;
  status: RiskLevel;
  summary: string;
  weatherDetails: string;
  newsDetails: string;
  mapInsights?: MapInsight;
  lastUpdated: string;
  sources: { title: string; uri: string }[];
}

export interface Alert {
  id: string;
  supplierId: string;
  supplierName: string;
  type: 'WEATHER' | 'NEWS' | 'SYSTEM';
  severity: RiskLevel;
  message: string;
  timestamp: string;
}
