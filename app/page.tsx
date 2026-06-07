'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, TrendingUp, User, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">PayTrackr</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-blue-400 transition">Features</a>
            <a href="#how" className="hover:text-blue-400 transition">How it Works</a>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  // Logged In User - Dropdown
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                      <Button variant="outline" className="flex items-center gap-2 text-black">
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2">
                      <User size={18} />
                      <span className="text-sm">{user.email?.split('@')[0]}</span>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </Button>
                  </div>
                ) : (
                  // Not Logged In
                  <>
                    <Link href="/login">
                      <Button variant="ghost">Log in</Button>
                    </Link>
                    <Link href="/login">
                      <Button>Get Started Free</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 text-white text-sm px-4 py-1.5 rounded-full mb-6 border border-white/10">
            <span className="text-emerald-400">●</span> Now with automated reminders
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            Never chase<br />
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              overdue payments
            </span>{" "}
            again
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Smart Invoice Aging Report + Automated Reminders for freelancers and small businesses. 
            Get paid faster with zero effort.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/login"}>
              <Button size="lg" className="text-lg px-10 py-7 rounded-2xl">
                {user ? "Go to Dashboard" : "Start Tracking Free"} <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-zinc-500 mt-6">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-t border-b border-white/10 py-4">
        <div className="max-w-5xl mx-auto px-6 flex justify-center items-center gap-12 text-zinc-400 text-sm">
          <div>Trusted by 800+ freelancers</div>
          <div>India • Global</div>
          <div>4.9/5 from users</div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-4">Everything you need to get paid faster</h2>
            <p className="text-zinc-400 text-lg">Powerful tools. Simple interface.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10 hover:border-blue-500/30 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Smart Aging Report</h3>
              <p className="text-zinc-400">Real-time aging buckets with beautiful visuals. Know exactly who owes what.</p>
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10 hover:border-blue-500/30 transition">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Automated Reminders</h3>
              <p className="text-zinc-400">Send gentle reminders 7 days before and on due date. Save hours of follow-ups.</p>
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-10 hover:border-blue-500/30 transition">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Peace of Mind</h3>
              <p className="text-zinc-400">Beautiful dashboard, CSV export, and complete payment history in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Ready to get paid on time?
          </h2>
          <p className="text-zinc-400 text-xl mb-10">
            Join hundreds of freelancers who stopped chasing payments.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-xl px-12 py-8 rounded-2xl">
              Create Free Account → 
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-zinc-500 text-sm">
        © 2026 PayTrackr. Built for freelancers in India and beyond.
      </footer>
    </div>
  );
}