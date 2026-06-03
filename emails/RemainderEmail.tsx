import * as React from 'react';

interface ReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysLeft: number;
  invoiceId: string;
}

export default function ReminderEmail({ 
  clientName, 
  invoiceNumber, 
  amount, 
  dueDate, 
  daysLeft,
  invoiceId 
}: ReminderEmailProps) {
  const payLink = `${process.env.NEXT_PUBLIC_BASE_URL}/pay/${invoiceId}`;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>Invoice Payment Reminder</h2>
      <p>Dear {clientName},</p>
      
      <p>This is a friendly reminder that your invoice <strong>#{invoiceNumber}</strong> 
      for <strong>₹{amount.toLocaleString('en-IN')}</strong> is due on <strong>{dueDate}</strong>.</p>
      
      <p><strong>{daysLeft} days remaining.</strong></p>

      <a 
        href={payLink}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '14px 28px',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-block',
          margin: '20px 0'
        }}
      >
        Pay Now ₹{amount.toLocaleString('en-IN')}
      </a>

      <p>If you've already paid, please ignore this email.</p>
      <p>Thank you for your business!</p>
    </div>
  );
}