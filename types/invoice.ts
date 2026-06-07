// types/invoice.ts
export type Invoice = {
  id: string;
  client_name: string;
  invoice_number?: string;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: string;
  notes?: string;
  client_email?: string;
  paid_date?: string | null;
};

export type InvoiceFormData = {
  id?: string;
  client_name: string;
  invoice_number?: string;
  amount: string;           // string for form input
  invoice_date: string;
  due_date: string;
  notes?: string;
  client_email?: string;
};
export type ClientRisk = {
  client_name: string;
  totalInvoices: number;
  totalAmount: number;
  avgDaysToPay: number;
  riskLevel: 'Good' | 'Risky';
  riskScore: number; // 0-100
};