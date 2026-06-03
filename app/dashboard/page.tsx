'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInDays } from 'date-fns';
import InvoiceForm from '@/components/InvoiceForm';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Invoice } from '@/types/invoice';

// type Invoice = {
//   id: string;
//   client_name: string;
//   invoice_number?: string;
//   amount: number;
//   invoice_date: string;
//   due_date: string;
//   status: string;
//   notes?: string;
// };

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) console.error(error);
    else setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const markAsPaid = async (id: string) => {
    await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    fetchInvoices();
  };

  const deleteInvoice = async () => {
    if (!deleteId) return;
    await supabase.from('invoices').delete().eq('id', deleteId);
    fetchInvoices();
    setDeleteId(null);
  };

  const openEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const getAgingBucket = (dueDate: string, status: string) => {
    if (status === 'paid') return { label: 'Paid', color: 'bg-green-100 text-green-700' };

    const daysOverdue = differenceInDays(new Date(), new Date(dueDate));
    if (daysOverdue < 0) return { label: 'Current', color: 'bg-green-100 text-green-700' };
    if (daysOverdue <= 30) return { label: `${daysOverdue} days`, color: 'bg-yellow-100 text-yellow-700' };
    if (daysOverdue <= 60) return { label: `${daysOverdue} days`, color: 'bg-orange-100 text-orange-700' };
    if (daysOverdue <= 90) return { label: `${daysOverdue} days`, color: 'bg-red-100 text-red-700' };
    return { label: '90+ days', color: 'bg-red-200 text-red-800' };
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">PayTrackr Dashboard</h1>
          <Button onClick={() => { setEditingInvoice(null); setShowForm(true); }} size="lg">
            + New Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total Outstanding</p>
            <p className="text-4xl font-bold mt-2">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Unpaid Invoices</p>
            <p className="text-4xl font-bold mt-2">{invoices.filter(i => i.status === 'unpaid').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">Total Invoices</p>
            <p className="text-4xl font-bold mt-2">{invoices.length}</p>
          </div>
        </div>

        {/* Invoice Aging Report */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold">Invoice Aging Report</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Client</th>
                  <th className="px-6 py-4 text-left">Invoice #</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-left">Due Date</th>
                  <th className="px-6 py-4 text-left">Aging</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const aging = getAgingBucket(invoice.due_date, invoice.status);
                  return (
                    <tr key={invoice.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{invoice.client_name}</td>
                      <td className="px-6 py-4">{invoice.invoice_number || '-'}</td>
                      <td className="px-6 py-4 text-right font-medium">₹{invoice.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{format(new Date(invoice.due_date), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${aging.color}`}>
                          {aging.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {invoice.status === 'unpaid' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsPaid(invoice.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEdit(invoice)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteId(invoice.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InvoiceForm 
        isOpen={showForm} 
        onClose={() => { 
          setShowForm(false); 
          setEditingInvoice(null); 
        }} 
        onSuccess={fetchInvoices}
        initialData={editingInvoice}     // Now type-safe
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteInvoice} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}