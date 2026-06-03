// app/api/reminders/route.ts
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';
import { format, differenceInDays } from 'date-fns';
import ReminderEmail from '@/emails/RemainderEmail';
import { render } from '@react-email/render';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') || '';
          return cookieHeader.split(';').map(c => {
            const [name, value] = c.trim().split('=');
            return { name, value };
          }).filter(c => c.name && c.value);
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'unpaid');

  let sentCount = 0;
  const errors: any[] = [];

  for (const invoice of invoices || []) {
    const daysUntilDue = differenceInDays(new Date(invoice.due_date), new Date());

    if (daysUntilDue === 7 || daysUntilDue <=5 || daysUntilDue <=0 ) {
      try {
        // Render React component to HTML
        const emailHtml = await render(
          ReminderEmail({
            clientName: invoice.client_name,
            invoiceNumber: invoice.invoice_number || 'N/A',
            amount: Number(invoice.amount),
            dueDate: format(new Date(invoice.due_date), 'dd MMM yyyy'),
            daysLeft: daysUntilDue,
            invoiceId: invoice.id,
          })
        );

        const result = await resend.emails.send({
          from: 'paytrackr <onboarding@resend.dev>',   // Use this for testing
          to: [user!.email!],
          subject: `🔔 Payment Reminder: Invoice #${invoice.invoice_number || 'N/A'} - ${invoice.client_name}`,
          html: emailHtml,                        // Use html instead of react
        });

        console.log("✅ Email sent successfully:", result);
        sentCount++;
      } catch (err: any) {
        console.error("❌ Email error:", err);
        errors.push({ invoice: invoice.invoice_number, error: err.message });
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    emailsSent: sentCount,
    totalUnpaid: invoices?.length || 0,
    userEmail: user?.email,
    errors: errors.length > 0 ? errors : null
  });
}