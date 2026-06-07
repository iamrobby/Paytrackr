'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Send, Check, X } from 'lucide-react';

type AIReminderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
};

export default function AIReminderModal({ isOpen, onClose, invoice }: AIReminderModalProps) {
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tone, setTone] = useState<'friendly' | 'professional' | 'firm'>('professional');
  const [copied, setCopied] = useState(false);

  const generateEmail = async () => {
    setLoading(true);
    setError('');
    setGeneratedEmail('');

    try {
      const response = await fetch('/api/ai-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice, tone }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedEmail(data.emailBody);
      } else {
        setError(data.error || "Failed to generate email");
      }
    } catch (err) {
      setError("Failed to connect to AI service. Please try again.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!invoice.client_email || !generatedEmail) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.client_email,
          subject: `Payment Reminder - Invoice #${invoice.invoice_number || 'N/A'}`,
          html: generatedEmail.replace(/\n/g, '<br/>'),
        }),
      });

      if (response.ok) {
        setSentSuccess(true);
        setTimeout(() => {
          onClose();
          resetState();
        }, 1500);
      } else {
        setError("Failed to send email");
      }
    } catch (err) {
      setError("Error sending email");
    }
    setSending(false);
  };

  const resetState = () => {
    setGeneratedEmail('');
    setError('');
    setSentSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl mx-4 p-8 shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">AI Reminder Generator</h2>
            <p className="text-gray-600 mt-1">
              For <strong>{invoice.client_name}</strong> • ₹{invoice.amount}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="flex gap-2 mb-6">
          {(['friendly', 'professional', 'firm'] as const).map((t) => (
            <Button
              key={t}
              variant={tone === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTone(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        <Button 
          onClick={generateEmail} 
          disabled={loading} 
          className="w-full mb-6 h-12 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              AI is generating...
            </>
          ) : (
            "✨ Generate AI Reminder Email"
          )}
        </Button>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {generatedEmail && (
          <div className="space-y-4">
            <Textarea 
              value={generatedEmail} 
              readOnly 
              rows={16}
              className="text-sm leading-relaxed font-medium resize-y"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy Email"}
              </Button>

              <Button 
                onClick={sendEmail} 
                disabled={sending || !invoice.client_email}
                className="flex-1"
              >
                {sending ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : sentSuccess ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {sentSuccess ? "Sent Successfully!" : "Send to Client"}
              </Button>
            </div>

            {!invoice.client_email && (
              <p className="text-amber-600 text-sm text-center font-medium">
                ⚠️ Client email is missing. Add it in the invoice first.
              </p>
            )}
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="mt-6 w-full text-gray-500"
        >
          Close
        </Button>
      </div>
    </div>
  );
}