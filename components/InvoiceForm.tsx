'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Invoice, InvoiceFormData } from '@/types/invoice';

type InvoiceFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Invoice | null;   // For editing
};

export default function InvoiceForm({ isOpen, onClose, onSuccess, initialData }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState<InvoiceFormData>({
    client_name: '',
    invoice_number: '',
    amount: '',
    invoice_date: '',
    due_date: '',
    notes: '',
    client_email: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        client_name: initialData.client_name,
        invoice_number: initialData.invoice_number || '',
        amount: initialData.amount.toString(),
        invoice_date: initialData.invoice_date,
        due_date: initialData.due_date,
        notes: initialData.notes || '',
        client_email: initialData.client_email || '',
      });
    } else {
      setFormData({
        client_name: '',
        invoice_number: '',
        amount: '',
        invoice_date: '',
        due_date: '',
        notes: '',
        client_email: '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {   // Updated type
    e.preventDefault();
    setLoading(true);

    const payload = {
      client_name: formData.client_name,
      invoice_number: formData.invoice_number,
      amount: parseFloat(formData.amount),
      invoice_date: formData.invoice_date,
      due_date: formData.due_date,
      notes: formData.notes,
      client_email: formData.client_email,
    };

    let error;

    if (initialData?.id) {
      // Update existing invoice
      ({ error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', initialData.id));
    } else {
      // Create new invoice
      ({ error } = await supabase
        .from('invoices')
        .insert({ ...payload, status: 'unpaid' ,user_id: (await supabase.auth.getUser()).data.user?.id}));
    }

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert(initialData?.id ? 'Invoice updated successfully!' : 'Invoice added successfully!');
      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {initialData ? 'Edit Invoice' : 'New Invoice'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>
          <div>
          <Label>Client Email</Label>
            <Input
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="client@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Reminders will be sent here</p>
          </div>

          <div>
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="INV-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="45000"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Input value={initialData ? "Existing" : "New (Unpaid)"} disabled className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Input
                id="invoice_date"
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Project details, terms, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1"
            >
              {loading 
                ? (initialData ? 'Updating...' : 'Adding...') 
                : (initialData ? 'Update Invoice' : 'Add Invoice')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}