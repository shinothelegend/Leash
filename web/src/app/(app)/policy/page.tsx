'use client';

import { useState } from 'react';
import { Card, Text } from '@tremor/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, ShieldAlert, Save } from 'lucide-react';

export default function PolicyPage() {
  const [dailyCap, setDailyCap] = useState('5.00');
  const [perTxCap, setPerTxCap] = useState('0.50');
  const [newVendor, setNewVendor] = useState('');
  const [vendors, setVendors] = useState<string[]>(['0x3F9a...7aB2', '0x2A1C...F001']);
  
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddVendor = () => {
    if (newVendor.trim()) {
      setVendors([...vendors, newVendor.trim()]);
      setNewVendor('');
    }
  };

  const handleRemoveVendor = (v: string) => {
    setVendors(vendors.filter(vendor => vendor !== v));
  };

  const handleSavePolicy = async () => {
    setIsSaving(true);
    // Simulate contract calls: setPolicy() and setVendorAllowed()
    setTimeout(() => {
      setIsSaving(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Policy Settings</h2>
        <p className="text-zinc-400 text-sm mt-1">Configure spending limits and allowed vendors for your AI agent.</p>
      </div>

      <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-8 p-8">
        
        {/* Caps */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-indigo-500" /> Spending Caps</h3>
            <p className="text-sm text-zinc-500 mt-1">Payments exceeding these limits will be escalated for Ledger approval.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="daily" className="text-zinc-300">Daily Cap (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input 
                  id="daily" 
                  value={dailyCap} 
                  onChange={(e) => setDailyCap(e.target.value)}
                  className="pl-7 bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500 font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pertx" className="text-zinc-300">Per-Transaction Cap (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input 
                  id="pertx" 
                  value={perTxCap} 
                  onChange={(e) => setPerTxCap(e.target.value)}
                  className="pl-7 bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800/50 w-full my-6"></div>

        {/* Vendor Allowlist */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100">Vendor Allowlist</h3>
            <p className="text-sm text-zinc-500 mt-1">Payments to vendors not on this list will be automatically escalated.</p>
          </div>
          
          <div className="flex gap-3">
            <Input 
              placeholder="0x..." 
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500 font-mono flex-1"
            />
            <Button onClick={handleAddVendor} variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              <Plus className="w-4 h-4 mr-2" /> Add Vendor
            </Button>
          </div>

          <div className="bg-zinc-950/30 border border-zinc-800/50 rounded-lg p-4 min-h-[120px] flex flex-wrap gap-2 content-start">
            {vendors.length === 0 ? (
              <span className="text-zinc-600 text-sm italic w-full text-center mt-6">No vendors explicitly allowed.</span>
            ) : (
              vendors.map((v, i) => (
                <Badge key={i} variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20 py-1.5 px-3 font-mono font-normal">
                  {v}
                  <button onClick={() => handleRemoveVendor(v)} className="ml-2 text-indigo-400 hover:text-indigo-300 focus:outline-none">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button className="bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 text-white border-0 hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Save className="w-4 h-4 mr-2" /> Review & Save Policy
              </Button>
            } />
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirm Policy Changes</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  You are about to push a new spending policy to the smart contract. This requires a transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 border-b border-zinc-800 pb-4">
                  <span className="col-span-2 text-sm font-medium text-zinc-400">Daily Cap</span>
                  <span className="col-span-2 text-right font-mono text-zinc-200">${dailyCap}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4 border-b border-zinc-800 pb-4">
                  <span className="col-span-2 text-sm font-medium text-zinc-400">Per-Tx Cap</span>
                  <span className="col-span-2 text-right font-mono text-zinc-200">${perTxCap}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="col-span-2 text-sm font-medium text-zinc-400">Allowed Vendors</span>
                  <span className="col-span-2 text-right font-mono text-emerald-500">+{vendors.length} Addresses</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 bg-transparent text-zinc-300">Cancel</Button>
                <Button onClick={handleSavePolicy} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSaving ? 'Signing...' : 'Sign & Submit Tx'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
