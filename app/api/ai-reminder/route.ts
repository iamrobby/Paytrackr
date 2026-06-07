// app/api/ai-reminder/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { invoice, tone } = await request.json();

    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        error: "Invoice data is required" 
      }, { status: 400 });
    }

    const tonePrompts = {
      friendly: "Write in a friendly, warm and polite tone.",
      professional: "Write in a professional, courteous and formal tone.",
      firm: "Write in a firm but respectful and professional tone."
    };

    const daysOverdue = Math.max(0, Math.floor(
      (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 3600 * 24)
    ));

    const prompt = `
You are an AI assistant helping a freelancer send a polite payment reminder.

Invoice Details:
- Client Name: ${invoice.client_name}
- Amount: ₹${invoice.amount}
- Invoice Number: ${invoice.invoice_number || 'N/A'}
- Due Date: ${invoice.due_date}
- Days Overdue: ${daysOverdue}

${tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.professional}

Write a natural, concise, and professional reminder email body.
Do not include subject line. Only return the email body text.
Keep it between 120-220 words.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",        // Fast & good quality
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const emailBody = data.choices?.[0]?.message?.content?.trim() || 
                     "Unable to generate reminder at this time.";

    return NextResponse.json({ 
      success: true, 
      emailBody 
    });

  } catch (error: any) {
    console.error("AI Reminder Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate AI reminder" 
    }, { status: 500 });
  }
}