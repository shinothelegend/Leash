'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, Text, BarChart, ProgressBar } from '@tremor/react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { AntiGravity, AntiGravityContainer } from '@/components/AntiGravity';

export default function ReputationPage() {
  const getReputationColor = (score: number): any => {
    if (score >= 90) return 'fuchsia'; // Will map to our pink-hot via dark-tremor
    if (score >= 70) return 'blue';
    return 'red';
  };

  const { data: paymentsCount } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'paymentsCount',
  });

  const count = Number(paymentsCount || 0n);
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

  const cardStyle = "bg-[#0A2740] border-[#428CD4]/20 ring-0 shadow-[0_12px_40px_-10px_rgba(0,78,154,0.4)]";

  return (
    <AntiGravityContainer className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pb-10">
      <AntiGravity delay={0}>
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#EAF1F8]">Reputation Oracle</h2>
          <p className="text-[#428CD4]/70 text-sm mt-1">On-chain behavioral scores for Agents and Vendors. (Note: Using on-chain fallback calculation due to missing Subgraph Studio Deploy Key).</p>
        </div>
      </AntiGravity>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Col: Top Vendors Chart */}
        <AntiGravity delay={0.1} className="lg:col-span-1 h-full">
          <Card className={`${cardStyle} h-full min-h-[350px] flex flex-col`}>
            <Text className="text-[#428CD4] mb-6 font-display">Top Vendors by Score</Text>
            {vendorStats.length > 0 ? (
              <BarChart
                className="flex-1 mt-4"
                data={vendorStats.slice(0, 5)}
                index="name"
                categories={["Reputation Score"]}
                colors={["blue" as any]}
                showAnimation={true}
                yAxisWidth={30}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#428CD4]/50">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p>No reputation data yet</p>
              </div>
            )}
          </Card>
        </AntiGravity>

        {/* Right Col: Tabs and Tables */}
        <AntiGravity delay={0.2} className="lg:col-span-2 flex flex-col">
          <Card className={`${cardStyle} flex-1 flex flex-col p-0 overflow-hidden min-h-[500px]`}>
            <Tabs defaultValue="vendors" className="flex-1 flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b border-[#428CD4]/20 bg-[#0A2740]">
                <TabsList className="bg-[#041B2D] border border-[#428CD4]/10">
                  <TabsTrigger value="vendors" className="data-[state=active]:bg-[var(--grad-pink)] data-[state=active]:text-white text-[#428CD4]/70 transition-all font-display tracking-wide">Vendors</TabsTrigger>
                  <TabsTrigger value="agents" className="data-[state=active]:bg-[#428CD4] data-[state=active]:text-[#EAF1F8] text-[#428CD4]/70 transition-all font-display tracking-wide">Agents</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="vendors" className="flex-1 overflow-auto m-0 bg-[#041B2D]/30">
                <Table>
                  <TableHeader className="bg-[#0A2740] sticky top-0 z-10 shadow-sm border-b border-[#428CD4]/20">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="text-[#428CD4] font-display">Vendor Address</TableHead>
                      <TableHead className="text-[#428CD4] font-display text-center">Approved</TableHead>
                      <TableHead className="text-[#428CD4] font-display text-center">Escalated</TableHead>
                      <TableHead className="text-[#428CD4] font-display text-center">Rejected</TableHead>
                      <TableHead className="text-[#428CD4] font-display w-48">Reputation Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorStats.length === 0 ? (
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableCell colSpan={5} className="h-48 text-center text-[#428CD4]/50">
                           No vendors interacted yet.
                        </TableCell>
                      </TableRow>
                    ) : vendorStats.map((v, i) => (
                      <TableRow key={i} className="border-b border-[#428CD4]/10 hover:bg-[#004E9A]/20 transition-colors">
                        <TableCell className="font-mono text-[#EAF1F8]" title={v.fullAddress}>{v.name}</TableCell>
                        <TableCell className="text-center font-mono text-[#428CD4]">{v.approved + v.released}</TableCell>
                        <TableCell className="text-center font-mono text-[#EA4492]">{v.escalated}</TableCell>
                        <TableCell className="text-center font-mono text-red-400">{v.rejected}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="w-8 text-right text-xs font-mono text-[#EAF1F8]">{v['Reputation Score']}</span>
                            <ProgressBar value={v['Reputation Score']} color={getReputationColor(v['Reputation Score'])} className="flex-1" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="agents" className="flex-1 overflow-auto m-0 bg-[#041B2D]/30">
                <div className="flex flex-col items-center justify-center h-64 text-[#428CD4]/50 space-y-2">
                  <p className="text-base font-display text-[#428CD4]/80 tracking-tight">Waiting for subgraph events...</p>
                  <p className="text-sm">Agent aggregation requires The Graph indexing.</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </AntiGravity>
      </div>
    </AntiGravityContainer>
  );
}
