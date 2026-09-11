'use client';

import Link from 'next/link';
import { Shield, Lock, Zap, FileCheck, ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const features = [
  { icon: Shield, title: 'Policy Enforcement', desc: 'Enforce daily and per-tx USD limits on-chain securely.' },
  { icon: Zap, title: 'x402 Settlement', desc: 'Instant micro-payments on Hedera network in sub-3s.' },
  { icon: Lock, title: 'Ledger Approval', desc: 'Escalate large requests to physical hardware signing.' },
  { icon: FileCheck, title: 'On-chain Reputation', desc: 'Direct contract-calculated agent trust metrics.' },
];

export default function LandingPage() {
  const scope = useRef(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray('.feature-card');
    gsap.fromTo(panels, 
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        ease: 'power3.out',
        stagger: 0.15,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.feature-section',
          start: 'top 85%',
        },
      }
    );
  }, { scope });

  return (
    <div ref={scope} className="min-h-screen relative flex flex-col items-center justify-start overflow-hidden bg-bg">
      {/* Ambient Hero Mesh */}
      <div className="hero-mesh">
        <div className="blob blob--blue"></div>
        <div className="blob blob--pink"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl"
        >
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white shadow-sm border border-border text-xs font-mono mb-12 text-ink-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot"></span>
            <span>x402 protocol v2 · Hedera Testnet</span>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-soft mb-8 border border-border relative">
               <Shield className="w-10 h-10 text-blue-bright absolute" />
               <div className="absolute inset-0 rounded-2xl bg-blue-bright/10 blur-xl -z-10"></div>
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 text-ink-900 leading-tight">
            Autonomous spending firewall <br/> for AI capacity.
          </h1>
          
          <p className="text-lg md:text-xl text-ink-600 mb-12 max-w-2xl leading-relaxed font-body">
            Set hard spending caps for AI agents. Payments execute micro-settlements over <code className="text-blue-deep font-mono text-sm px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">x402</code> on Hedera — high-risk transactions halt for hardware signing.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Link href="/dashboard">
              <Button className="h-14 px-8 text-base font-semibold rounded-pill bg-blue-deep text-white hover:bg-blue-deep/90 transition-all shadow-soft border-0">
                Launch Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/shinothelegend/Leash" target="_blank" rel="noreferrer">
              <Button variant="outline" className="h-14 px-8 text-base font-semibold bg-white border-border hover:bg-slate-50 text-ink-900 font-mono rounded-pill shadow-sm">
                <Terminal className="w-4 h-4 mr-2 text-ink-400" /> npm run agent
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="feature-section relative z-10 w-full max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="feature-card card p-8 group opacity-0"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 mb-6 group-hover:bg-blue-bright transition-colors duration-300">
                <feat.icon className="w-6 h-6 text-blue-deep group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold font-display text-ink-900 mb-3">{feat.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed font-body">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
