// app/api/send-email/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html, invoiceId } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: 'PayTrackr <onboarding@resend.dev>', // Change to your domain later
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} | Invoice: ${invoiceId}`);

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      data: result 
    });

  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}