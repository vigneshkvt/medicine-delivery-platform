import { apiRequest } from './apiClient';

export interface MedicineSearchResult {
  id: string;
  name: string;
  composition?: string;
  manufacturer?: string;
  form?: string;
  strength?: string;
  schedule?: string;
  requiresPrescription: boolean;
  maximumRetailPrice?: number;
  ogdSource?: string;
}

export const searchMedicines = (term: string, limit = 25) =>
  apiRequest<MedicineSearchResult[]>({
    path: `/api/medicines/search?query=${encodeURIComponent(term)}&limit=${limit}`,
    method: 'GET',
    includeAuth: false
  });

export interface OgdCompliancePhase {
  name: string;
  objective: string;
  requiredActions: string[];
}

export interface OgdComplianceSummary {
  jurisdiction: string;
  summary: string;
  phases: OgdCompliancePhase[];
}

export const fetchOgdComplianceSummary = () =>
  apiRequest<OgdComplianceSummary>({
    path: '/api/policies/ogd-compliance',
    method: 'GET',
    includeAuth: false
  });
