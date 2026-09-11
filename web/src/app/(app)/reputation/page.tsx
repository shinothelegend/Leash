'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, Text, BarChart, ProgressBar } from '@tremor/react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { useMemo } from 'react';
import { Activity } from 'lucide-react';

export default function ReputationPage() {
  const getReputationColor = (score: number) => {
    if (score >= 90) return 'emerald';
    if (score >= 70) return 'amber';
    return 'red';
  };

  const { data: paymentsCount } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'paymentsCount',
  });

  const count = Number(paymentsCount || 0n);
  // Fetch up to the last 100 payments to calculate fallback reputation
  const limit = Math.min(100, count);
  const startIdx = Math.max(0, count - limit);
  const paymentIndices = Array.from({ length: limit }, (_, i) => BigInt(startIdx + i));

  const { data: paymentsData } = useReadContracts({
    contracts: paymentIndices.map(idx => ({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'payments',
      args: [idx],
    })),
  });

  const vendorStats = useMemo(() => {
    const stats: Record<string, { approved: number; escalated: number; rejected: number; released: number }> = {};
    
    if (paymentsData) {
      paymentsData.forEach((result) => {
        if (result.status === 'success' && result.result) {
          const [vendor, , , status] = result.result as unknown as [string, bigint, bigint, number, bigint, string];
          if (!stats[vendor]) {
            stats[vendor] = { approved: 0, escalated: 0, rejected: 0, released: 0 };
          }
          if (status === 0) stats[vendor].approved++;
          if (status === 1) stats[vendor].escalated++;
          if (status === 2) stats[vendor].rejected++;
          if (status === 3) stats[vendor].released++;
        }
      });
    }

    return Object.entries(stats).map(([vendor, data]) => {
      const total = data.approved + data.escalated + data.rejected + data.released;
      const good = data.approved + data.released;
      const score = total > 0 ? Math.round((good / total) * 100) : 100;
      return {
        name: `${vendor.slice(0,6)}...${vendor.slice(-4)}`,
        fullAddress: vendor,
        'Reputation Score': score,
        ...data,
      };
    }).sort((a, b) => b['Reputation Score'] - a['Reputation Score']);
  }, [paymentsData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Reputation Oracle</h2>
        <p className="text-zinc-400 text-sm mt-1">On-chain behavioral scores for Agents and Vendors. (Note: Using on-chain fallback calculation due to missing Subgraph Studio Deploy Key).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Col: Top Vendors Chart */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-full min-h-[350px]">
            <Text className="text-zinc-400 mb-6">Top Vendors by Score</Text>
            {vendorStats.length > 0 ? (
              <BarChart
                className="h-64"
                data={vendorStats.slice(0, 5)}
                index="name"
                categories={["Reputation Score"]}
                colors={["indigo"]}
                showAnimation={true}
                yAxisWidth={30}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p>No reputation data yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Tabs and Tables */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex-1 flex flex-col p-0 overflow-hidden">
            <Tabs defaultValue="vendors" className="flex-1 flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
                <TabsList className="bg-zinc-950/50 border border-zinc-800/50">
                  <TabsTrigger value="vendors" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">Vendors</TabsTrigger>
                  <TabsTrigger value="agents" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">Agents</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="vendors" className="flex-1 overflow-auto m-0">
                <Table>
                  <TableHeader className="bg-zinc-950/50 sticky top-0 z-10">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Vendor Address</TableHead>
                      <TableHead className="text-zinc-400 text-center">Approved</TableHead>
                      <TableHead className="text-zinc-400 text-center">Escalated</TableHead>
                      <TableHead className="text-zinc-400 text-center">Rejected</TableHead>
                      <TableHead className="text-zinc-400 w-48">Reputation Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorStats.length === 0 ? (
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableCell colSpan={5} className="h-48 text-center text-zinc-500">
                           No vendors interacted yet.
                        </TableCell>
                      </TableRow>
                    ) : vendorStats.map((v, i) => (
                      <TableRow key={i} className="border-zinc-800/50 hover:bg-zinc-800/20">
                        <TableCell className="font-mono text-zinc-300" title={v.fullAddress}>{v.name}</TableCell>
                        <TableCell className="text-center text-zinc-400">{v.approved + v.released}</TableCell>
                        <TableCell className="text-center text-zinc-400">{v.escalated}</TableCell>
                        <TableCell className="text-center text-zinc-400">{v.rejected}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="w-8 text-right text-xs font-mono text-zinc-300">{v['Reputation Score']}</span>
                            <ProgressBar value={v['Reputation Score']} color={getReputationColor(v['Reputation Score'])} className="flex-1" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="agents" className="flex-1 overflow-auto m-0">
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-2">
                  <p className="text-base font-medium text-zinc-400">Waiting for subgraph events...</p>
                  <p className="text-sm">Agent aggregation requires The Graph indexing.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
