'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card } from '@tremor/react';
import { Receipt, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { useState } from 'react';

const STATUS_MAP = ['Approved', 'Escalated', 'Rejected', 'Released'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved' || status === 'Released') return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{status}</Badge>;
  if (status === 'Escalated') return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Escalated</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
  return <Badge>{status}</Badge>;
};

export default function PaymentsPage() {
  const tabs = ['All', 'Approved', 'Escalated', 'Rejected', 'Released'];
  const [filter, setFilter] = useState('All');

  const { data: paymentsCount } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'paymentsCount',
  });

  const count = Number(paymentsCount || 0n);
  // Fetch up to the last 50 payments
  const limit = Math.min(50, count);
  const startIdx = Math.max(0, count - limit);
  const paymentIndices = Array.from({ length: limit }, (_, i) => BigInt(startIdx + i)).reverse();

  const { data: paymentsData } = useReadContracts({
    contracts: paymentIndices.map(idx => ({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'payments',
      args: [idx],
    })),
  });

  const allPayments = paymentsData?.map((result, i) => {
    if (result.status === 'success' && result.result) {
      const [vendor, amountWei, amountUsdCents, status, timestamp, resource] = result.result as [string, bigint, bigint, number, bigint, string];
      return {
        id: paymentIndices[i].toString(),
        vendor,
        amount: `$${(Number(amountUsdCents) / 100).toFixed(2)}`,
        status: STATUS_MAP[status],
        resource,
        timestamp: Number(timestamp) * 1000,
      };
    }
    return null;
  }).filter(Boolean) || [];

  const filteredPayments = filter === 'All' 
    ? allPayments 
    : allPayments.filter(p => p?.status === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Live Payment Feed</h2>
          <p className="text-zinc-400 text-sm mt-1">Real-time stream of all agent transactions and policy evaluations.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search vendor or TxHash..." 
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex-1 flex flex-col p-0 overflow-hidden">
        <Tabs defaultValue="All" value={filter} onValueChange={setFilter} className="flex-1 flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
            <TabsList className="bg-zinc-950/50 border border-zinc-800/50">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-zinc-950/50 sticky top-0 z-10">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-[100px] text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Vendor</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Resource</TableHead>
                  <TableHead className="text-zinc-400">Timestamp</TableHead>
                  <TableHead className="text-zinc-400 text-right">HashScan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell colSpan={7} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-inner">
                          <Receipt className="w-8 h-8 text-zinc-600" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-base font-medium text-zinc-400">No payments found</p>
                          <p className="text-sm">Wait for new transactions or change filter.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map(p => p && (
                    <TableRow key={p.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                      <TableCell className="font-mono text-zinc-400">{p.id}</TableCell>
                      <TableCell className="font-mono text-zinc-300">{p.vendor.slice(0,6)}...{p.vendor.slice(-4)}</TableCell>
                      <TableCell className="font-mono text-zinc-100">{p.amount}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-zinc-300 max-w-[200px] truncate" title={p.resource}>{p.resource}</TableCell>
                      <TableCell className="text-zinc-400 text-sm">{new Date(p.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <a href={`https://hashscan.io/testnet/account/${POLICY_VAULT_ADDRESS}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm">View Contract</a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
