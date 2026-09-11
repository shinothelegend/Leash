import Link from 'next/link';
import { Shield, Lock, Zap, FileCheck, ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#7C5CFF] selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#7C5CFF]/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-[#3DDCFF]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-4xl px-4 flex flex-col items-center pt-12">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#50F0C8] animate-pulse"></span>
          <span>x402 protocol v2 · Hedera Testnet</span>
        </div>

        <Shield className="w-16 h-16 text-[#7C5CFF] mb-6 drop-shadow-[0_0_20px_rgba(124,92,255,0.6)]" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C5CFF] via-[#3DDCFF] to-[#50F0C8]">
            Autonomous spending firewall
          </span>
          <br />
          for AI agent capacity.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
          Set hard spending caps for AI agents. Payments execute micro-settlements over <code className="text-[#3DDCFF] font-mono text-sm">x402</code> on Hedera — high-risk transactions halt for Ledger hardware signing.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button className="h-13 px-8 text-base font-medium bg-[#7C5CFF] hover:bg-[#6b47ff] text-white border-0 shadow-[0_0_25px_rgba(124,92,255,0.4)] transition-all hover:scale-[1.02]">
              Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="https://github.com/shinothelegend/Leash" target="_blank" rel="noreferrer">
            <Button variant="outline" className="h-13 px-8 text-base font-medium bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono">
              <Terminal className="w-4 h-4 mr-2 text-[#3DDCFF]" /> npm run agent
            </Button>
          </a>
        </div>
      </div>

      {/* Features Row */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-4 gap-5 mt-20 max-w-6xl w-full px-6 pb-16">
        {[
          { icon: Shield, title: 'Policy Enforcement', desc: 'Enforce daily and per-tx USD limits on-chain.' },
          { icon: Zap, title: 'x402 Settlement', desc: 'Instant micro-payments on Hedera in sub-3s.' },
          { icon: Lock, title: 'Ledger Approval', desc: 'Escalate large requests to physical hardware signing.' },
          { icon: FileCheck, title: 'On-chain Reputation', desc: 'Direct contract-calculated trust metrics.' },
        ].map((feat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-6 backdrop-blur-md hover:border-[#7C5CFF]/40 transition-all hover:-translate-y-0.5 group">
            <feat.icon className="w-7 h-7 text-[#7C5CFF] group-hover:text-[#3DDCFF] transition-colors mb-4" />
            <h3 className="text-base font-semibold text-zinc-100 mb-1.5">{feat.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

