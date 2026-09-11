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
    <div className="flex min-h-screen bg-[#0A0A0F] text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-[#0A0A0F]/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Shield className="w-6 h-6 mr-2 text-indigo-500" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 tracking-tight">
            Leash
          </span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-transparent text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-500' : 'text-zinc-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 flex flex-col gap-2">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Network</span>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-medium">Hedera Testnet</span>
            </div>
            
            {address && (
              <>
                <div className="h-px bg-zinc-800 my-1"></div>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Wallet</span>
                <span className="text-xs font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-300 truncate">
                  {address}
                </span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800 bg-[#0A0A0F]/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold capitalize text-zinc-100">
            {pathname.replace('/', '') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Button
              variant={address ? "outline" : "default"}
              className={address ? "border-zinc-700 bg-zinc-900 text-zinc-300" : "bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 text-white border-0 hover:opacity-90"}
              onClick={connectWallet}
            >
              {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
            </Button>
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-y-auto relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
          {children}
        </div>
      </main>
    </div>
  );
}
