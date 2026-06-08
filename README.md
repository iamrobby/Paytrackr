# PayTrackr 💰

<p align="center">
  <strong>Invoice Aging Report + Automated Payment Reminders for Freelancers & Small Businesses.</strong>
  <br />
  Get paid faster with smart tracking and automatic reminders.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgresql" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 🚀 Features

- **Real-time Invoice Aging Report** – Track unpaid invoices categorized by timeline: Current, 1–30, 31–60, 61–90, and 90+ days past due.
- **Automated Email Reminders** – Gently nudge clients with automated reminders sent 7 days before and exactly on the due date.
- **Fast Data analysis and Risk Analysis** – Easily recognise who pays faster and who pays late
- **Client Email Support** – Seamlessly send updates directly to your client's inbox.
- **Modern Dashboard** – A clean, beautiful, and intuitive user interface optimized for desktop and mobile tracking.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend & Database:** Supabase (PostgreSQL + Built-in Authentication)
- **Email Service:** Resend
- **Deployment:** Vercel

---

## 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Clone the repository

```bash
git clone [https://github.com/iamrobby/Paytrackr.git](https://github.com/iamrobby/Paytrackr.git)
cd Paytrackr
npm install
```
### Setup a Env file and have these to run locally
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
```
