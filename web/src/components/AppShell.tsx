'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, CheckSquare, BarChart3, Settings, Shield, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Live Feed', href: '/payments', icon: CreditCard },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Reputation', href: '/reputation', icon: BarChart3 },
  { name: 'Policy', href: '/policy', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setAddress(accounts[0]);
        })
        .catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) setAddress(accounts[0]);
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    } else {
      alert('MetaMask / EVM Wallet not detected.');
    }
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink-900 font-body">
      {/* Sidebar - Dark Accent Surface */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-[#0B1220] hidden md:flex flex-col relative overflow-hidden">
        {/* Subtle glow in sidebar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

        <div className="h-16 flex items-center px-6 border-b border-white/10 relative z-10">
          <Shield className="w-6 h-6 mr-2 text-blue-bright" />
          <span className="text-xl font-bold font-display text-white tracking-tight">
            Leash
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-pill transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white font-semibold border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-bright' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 relative z-10">
          <div className="bg-[#131B2C] border border-white/5 rounded-lg p-3.5 flex flex-col gap-2 shadow-inner">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Network</span>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-medium text-slate-200">Hedera Testnet</span>
            </div>
            
            {address && (
              <>
                <div className="h-px bg-white/5 my-1"></div>
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Wallet</span>
                <span className="text-xs font-mono bg-black/40 px-2 py-1.5 rounded text-blue-300 truncate border border-white/5">
                  {address}
                </span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative">
        <header className="h-16 border-b border-border bg-white/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-bold capitalize font-display text-ink-900 tracking-tight">
            {pathname.replace('/', '') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-ink-400 hover:text-ink-900 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Button
              variant={address ? "outline" : "default"}
              className={address ? "border-border bg-white text-ink-900 hover:bg-slate-50 rounded-pill shadow-sm" : "bg-ink-900 text-white font-medium border-0 hover:bg-ink-900/90 rounded-pill shadow-soft"}
              onClick={connectWallet}
            >
              {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
            </Button>
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-y-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
