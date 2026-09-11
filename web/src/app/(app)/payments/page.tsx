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
import { AntiGravity, AntiGravityContainer } from '@/components/AntiGravity';

const STATUS_MAP = ['Approved', 'Escalated', 'Rejected', 'Released'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved' || status === 'Released') return <Badge className="bg-[#428CD4]/10 text-[#428CD4] border-[#428CD4]/20 hover:bg-[#428CD4]/20">{status}</Badge>;
  if (status === 'Escalated') return <Badge className="bg-[#EA4492]/10 text-[#EA4492] border-[#EA4492]/20 hover:bg-[#EA4492]/20">Escalated</Badge>;
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
      const [vendor, amountWei, amountUsdCents, status, timestamp, resource] = result.result as unknown as [string, bigint, bigint, number, bigint, string];
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
    <AntiGravityContainer className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-10">
      <AntiGravity delay={0} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#EAF1F8]">Live Payment Feed</h2>
          <p className="text-[#428CD4]/70 text-sm mt-1">Real-time stream of all agent transactions and policy evaluations.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#428CD4]/50" />
          <Input 
            placeholder="Search vendor or TxHash..." 
            className="pl-9 bg-[#041B2D] border-[#428CD4]/30 text-[#EAF1F8] placeholder:text-[#428CD4]/40 focus-visible:ring-[#EA4492] font-mono shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          />
        </div>
      </AntiGravity>

      <AntiGravity delay={0.1} className="flex-1 flex flex-col">
        <Card className="bg-[#0A2740] border-[#428CD4]/20 ring-0 shadow-[0_12px_40px_-10px_rgba(0,78,154,0.4)] flex-1 flex flex-col p-0 overflow-hidden min-h-[500px]">
          <Tabs defaultValue="All" value={filter} onValueChange={setFilter} className="flex-1 flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-[#428CD4]/20 bg-[#0A2740]">
              <TabsList className="bg-[#041B2D] border border-[#428CD4]/10">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="data-[state=active]:bg-[var(--grad-pink)] data-[state=active]:text-white text-[#428CD4]/70 transition-all font-display tracking-wide"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-[#041B2D]/30">
              <Table>
                <TableHeader className="bg-[#0A2740] sticky top-0 z-10 shadow-sm border-b border-[#428CD4]/20">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="w-[100px] text-[#428CD4] font-display">ID</TableHead>
                    <TableHead className="text-[#428CD4] font-display">Vendor</TableHead>
                    <TableHead className="text-[#428CD4] font-display">Amount</TableHead>
                    <TableHead className="text-[#428CD4] font-display">Status</TableHead>
                    <TableHead className="text-[#428CD4] font-display">Resource</TableHead>
                    <TableHead className="text-[#428CD4] font-display">Timestamp</TableHead>
                    <TableHead className="text-[#428CD4] font-display text-right">HashScan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow className="hover:bg-transparent border-0">
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center text-[#428CD4]/50 space-y-4">
                          <div className="w-16 h-16 rounded-full bg-[#041B2D] border border-[#428CD4]/20 flex items-center justify-center shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                            <Receipt className="w-8 h-8 text-[#428CD4]/40" />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-base font-display tracking-tight text-[#428CD4]/80">No payments found</p>
                            <p className="text-sm">Wait for new transactions or change filter.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map(p => p && (
                      <TableRow key={p.id} className="border-b border-[#428CD4]/10 hover:bg-[#004E9A]/20 transition-colors">
                        <TableCell className="font-mono text-[#428CD4]/70">{p.id}</TableCell>
                        <TableCell className="font-mono text-[#EAF1F8]">{p.vendor.slice(0,6)}...{p.vendor.slice(-4)}</TableCell>
                        <TableCell className="font-mono text-[#FF9CDA] drop-shadow-[0_0_5px_rgba(255,156,218,0.3)]">{p.amount}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                        <TableCell className="text-[#EAF1F8] max-w-[200px] truncate" title={p.resource}>{p.resource}</TableCell>
                        <TableCell className="text-[#428CD4]/70 text-sm">{new Date(p.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <a href={`https://hashscan.io/testnet/account/${POLICY_VAULT_ADDRESS}`} target="_blank" rel="noreferrer" className="text-[#EA4492] hover:text-[#FF9CDA] hover:underline text-sm transition-colors">View Contract</a>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </Card>
      </AntiGravity>
    </AntiGravityContainer>
  );
}
