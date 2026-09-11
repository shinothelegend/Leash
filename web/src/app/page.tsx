import Link from 'next/link';
import { Shield, Lock, Zap, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-4xl px-4 flex flex-col items-center">
        <Shield className="w-16 h-16 text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500">
            A spending firewall
          </span>
          <br />
          for autonomous AI agents.
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
          Let your AI agents pay on their own — up to the limits you set. Anything over the line needs your hardware-wallet approval.
        </p>

        <Link href="/dashboard">
          <Button className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 border-0 hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:scale-105">
            Launch App
          </Button>
        </Link>
      </div>

      {/* Features Row */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mt-24 max-w-6xl w-full px-6">
        {[
          { icon: Shield, title: 'Policy Enforcement', desc: 'Set hard caps on daily and per-tx spending.' },
          { icon: Zap, title: 'x402 Auto-Payments', desc: 'Instant micro-transactions for AI services.' },
          { icon: Lock, title: 'Ledger Approval', desc: 'Escalate large payments to physical signing.' },
          { icon: FileCheck, title: 'On-chain Reputation', desc: 'Trust vendors through The Graph subgraph.' },
        ].map((feat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
            <feat.icon className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feat.title}</h3>
            <p className="text-sm text-zinc-400">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
