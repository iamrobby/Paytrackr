'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInDays } from 'date-fns';
import InvoiceForm from '@/components/InvoiceForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
import type { Invoice,ClientRisk } from '@/types/invoice';
import AIReminderModal from '@/components/AIReminderModal';

const RISK_COLORS = {
  Good: '#22c55e',
  Slow: '#eab308',
  Risky: '#ef4444'
};

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clientRisks, setClientRisks] = useState<any[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedInvoiceForAI, setSelectedInvoiceForAI] = useState<any>(null);
  const supabase = createClient();

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('due_date', { ascending: true });
      calculateClientRisk(data || []);

    if (error) console.error(error);
    else setInvoices(data || []);
    setLoading(false);
  };
const calculateClientRisk = (allInvoices: Invoice[]) => {
  const clientMap = new Map<string, { invoices: Invoice[] }>();

  allInvoices.forEach((inv: Invoice) => {
    if (!clientMap.has(inv.client_name)) {
      clientMap.set(inv.client_name, { invoices: [] });
    }
    clientMap.get(inv.client_name)!.invoices.push(inv);
  });

  const riskData = Array.from(clientMap.values()).map(client => {
    const totalInvoices = client.invoices.length;
    let goodPayments = 0;
    let latePayments = 0;

    client.invoices.forEach(inv => {
      if (inv.status === 'paid' && inv.paid_date) {
        const due = new Date(inv.due_date);
        const paid = new Date(inv.paid_date);
        
        if (paid <= due) {
          goodPayments++;
        } else {
          latePayments++;
        }
      } else if (inv.status === 'unpaid') {
        // Unpaid invoices are considered risky for now
        latePayments++;
      }
    });

    const onTimeRatio = totalInvoices > 0 ? Math.round((goodPayments / totalInvoices) * 100) : 0;
    
    const riskLevel = latePayments > 0 ? 'Risky' : 'Good';

    return {
      client_name: client.invoices[0].client_name,
      totalInvoices,
      goodPayments,
      latePayments,
      onTimeRatio,
      riskLevel,
    };
  });

  // Sort Risky first
  riskData.sort((a, b) => b.latePayments - a.latePayments);

  setClientRisks(riskData);
};
  useEffect(() => {
    fetchInvoices();
  }, []);

  const markAsPaid = async (id: string) => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('invoices')
    .update({ 
      status: 'paid',
      paid_date: now 
    })
    .eq('id', id);

  if (error) {
    alert('Error marking as paid');
  } else {
    fetchInvoices();
  }
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

  const calculateAgingData = () => {
    const agingBuckets = {
      'Current': 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0
    };

    invoices.forEach(invoice => {
      if (invoice.status === 'paid') return;

      const daysOverdue = differenceInDays(new Date(), new Date(invoice.due_date));
      
      if (daysOverdue < 0) {
        agingBuckets['Current']++;
      } else if (daysOverdue <= 30) {
        agingBuckets['1-30']++;
      } else if (daysOverdue <= 60) {
        agingBuckets['31-60']++;
      } else if (daysOverdue <= 90) {
        agingBuckets['61-90']++;
      } else {
        agingBuckets['90+']++;
      }
    });

    return Object.entries(agingBuckets).map(([name, value]) => ({ name, value }));
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
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsPaid(invoice.id)}
                          >
                            Mark Paid
                          </Button>

                          {/* New AI Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvoiceForAI(invoice);
                              setShowAIModal(true);
                            }}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                          >
                            ✨ AI Reminder
                          </Button>
                        </>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-9 mb-8 ml-10">
          <Card>
            <CardHeader><CardTitle className="text-sm">Good Payers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {clientRisks.filter(c => c.riskLevel === 'Good').length}
              </p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader><CardTitle className="text-sm">Slow Payers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-600">
                {clientRisks.filter(c => c.riskLevel === 'Slow').length}
              </p>
            </CardContent>
          </Card> */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Risky Clients</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600">
                {clientRisks.filter(c => c.riskLevel === 'Risky').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Total Outstanding</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                ₹{invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle>Aging Overview</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculateAgingData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Client Risk Distribution</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={clientRisks} dataKey="totalInvoices" nameKey="client_name" cx="50%" cy="50%" outerRadius={100}>
                    {clientRisks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
  <thead>
    <tr className="border-b">
      <th className="text-left py-3">Client</th>
      <th className="text-right py-3">Total Invoices</th>
      <th className="text-right py-3">On Time</th>
      <th className="text-center py-3">Risk Level</th>
    </tr>
  </thead>
  <tbody>
    {clientRisks.map((client, idx) => (
      <tr key={idx} className="border-b hover:bg-gray-50">
        <td className="py-4 font-medium">{client.client_name}</td>
        <td className="py-4 text-right">{client.totalInvoices}</td>
        <td className="py-4 text-right">{client.onTimeRatio}%</td>
        <td className="py-4 text-center">
          <span className={`px-4 py-1 rounded-full text-sm font-medium ${
            client.riskLevel === 'Good' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {client.riskLevel}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          </CardContent>
        </Card>
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
      {/* AI Reminder Modal */}
        <AIReminderModal 
          isOpen={showAIModal} 
          onClose={() => {
            setShowAIModal(false);
            setSelectedInvoiceForAI(null);
          }} 
          invoice={selectedInvoiceForAI} 
        />
    </div>
  );
}