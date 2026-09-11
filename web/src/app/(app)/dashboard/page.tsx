'use client';

import { Card, Metric, Text, AreaChart, BadgeDelta, Flex, ProgressBar } from '@tremor/react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { AntiGravity, AntiGravityContainer } from '@/components/AntiGravity';

const STATUS_MAP = ['Approved', 'Escalated', 'Rejected', 'Released'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved' || status === 'Released') return <Badge className="bg-[#428CD4]/10 text-[#428CD4] border-[#428CD4]/20 hover:bg-[#428CD4]/20">{status}</Badge>;
  if (status === 'Escalated') return <Badge className="bg-[#EA4492]/10 text-[#EA4492] border-[#EA4492]/20 hover:bg-[#EA4492]/20">Escalated</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
  return <Badge>{status}</Badge>;
};

export default function DashboardPage() {
  const { data: spentToday } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'spentTodayUsdCents',
  });

  const { data: dailyCap } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'dailyCapUsdCents',
  });

  const { data: paymentsCount } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'paymentsCount',
  });

  const spentUsd = spentToday ? Number(spentToday) / 100 : 0;
  const capUsd = dailyCap ? Number(dailyCap) / 100 : 0;
  const percentSpent = capUsd > 0 ? (spentUsd / capUsd) * 100 : 0;

  const count = Number(paymentsCount || 0n);
  const startIdx = Math.max(0, count - 15); // Fetch more for chart
  const paymentIndices = Array.from({ length: Math.min(15, count) }, (_, i) => BigInt(startIdx + i)).reverse();

  const { data: recentPaymentsData } = useReadContracts({
    contracts: paymentIndices.map(idx => ({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'payments',
      args: [idx],
    })),
  });

  const allRecent = recentPaymentsData?.map((result, i) => {
    if (result.status === 'success' && result.result) {
      const [vendor, amountWei, amountUsdCents, status, timestamp, resource] = result.result as unknown as [string, bigint, bigint, number, bigint, string];
      return {
        id: paymentIndices[i].toString(),
        vendor: `${vendor.slice(0,6)}...${vendor.slice(-4)}`,
        amount: `$${(Number(amountUsdCents) / 100).toFixed(2)}`,
        amountRaw: Number(amountUsdCents) / 100,
        status: STATUS_MAP[status],
        timestamp: Number(timestamp) * 1000,
        timeLabel: new Date(Number(timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return null;
  }).filter(Boolean) || [];

  const recentActivity = allRecent.slice(0, 5); // top 5 for the list
  const chartData = [...allRecent].reverse(); // oldest to newest for chart

  const cardStyle = "bg-[#0A2740] border-[#428CD4]/20 ring-0 shadow-[0_12px_40px_-10px_rgba(0,78,154,0.4)] hover:shadow-[0_0_20px_rgba(234,68,146,0.15)] hover:-translate-y-[2px] transition-all duration-300";

  return (
    <AntiGravityContainer className="space-y-8 max-w-7xl mx-auto py-8">
      
      <AntiGravity delay={0}>
        <div className="mb-10">
          <h1 className="font-display font-bold text-[clamp(2.75rem,6vw,5rem)] leading-none tracking-[-0.02em] text-[#EAF1F8]">
            Agentic AI <br />
            <span className="bg-clip-text text-transparent bg-[var(--grad-pink)] text-shadow-glow">spending firewall.</span>
          </h1>
        </div>
      </AntiGravity>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AntiGravity delay={0.1}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Spent Today</Text>
            <Metric className="text-[#EAF1F8] font-mono mt-2">${spentUsd.toFixed(2)}</Metric>
            <Flex className="mt-4">
              <Text className="text-[#428CD4]/70 text-xs truncate">{percentSpent.toFixed(1)}% of daily cap</Text>
            </Flex>
            <ProgressBar value={percentSpent} color="brand" className="mt-2 opacity-80" />
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.2}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Daily Cap</Text>
            <Metric className="text-[#EAF1F8] font-mono mt-2">${capUsd.toFixed(2)}</Metric>
            <Flex className="mt-4">
              <Text className="text-[#428CD4]/70 text-xs truncate">Resets in 24h</Text>
            </Flex>
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.3}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Total Payments</Text>
            <Metric className="text-[#FF9CDA] font-mono mt-2">{count}</Metric>
            <Flex className="mt-4">
              <BadgeDelta deltaType="increase" size="xs" className="bg-[#EA4492]/10 text-[#EA4492]">Tracked on-chain</BadgeDelta>
            </Flex>
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.4}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Agent Status</Text>
            <div className="flex items-center gap-2 mt-3">
              <Activity className="w-8 h-8 text-[#428CD4] drop-shadow-[0_0_10px_rgba(66,140,212,0.8)]" />
              <Metric className="text-[#EAF1F8]">Active</Metric>
            </div>
            <Flex className="mt-4">
              <Text className="text-[#428CD4]/70 text-xs">Monitoring payments...</Text>
            </Flex>
          </Card>
        </AntiGravity>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <AntiGravity delay={0.5} className="lg:col-span-2 h-full">
          <Card className={`${cardStyle} h-full min-h-[400px] flex flex-col`}>
            <div className="mb-4">
              <Text className="text-[#428CD4] text-lg font-display tracking-tight">Recent Payment Volume</Text>
            </div>
            
            {chartData.length > 0 ? (
              <AreaChart
                className="h-72 mt-4"
                data={chartData}
                index="timeLabel"
                categories={["amountRaw"]}
                colors={["brand"]}
                valueFormatter={(number) => `$${number.toFixed(2)}`}
                showLegend={false}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Activity className="w-12 h-12 text-[#428CD4]/30 mb-4" />
                <Text className="text-[#428CD4]/50">Waiting for on-chain data...</Text>
              </div>
            )}
          </Card>
        </AntiGravity>

        {/* Right Column (Activity) */}
        <AntiGravity delay={0.6} className="lg:col-span-1 h-full">
          <Card className={`${cardStyle} h-full flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <Text className="text-[#428CD4] text-lg font-display tracking-tight">Recent Activity</Text>
              <Link href="/payments" className="text-[#EA4492] hover:text-[#FF9CDA] text-sm flex items-center transition-colors">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 space-y-4">
              {recentActivity.length === 0 ? (
                 <div className="text-center py-8 text-[#428CD4]/50 text-sm">No recent payments</div>
              ) : recentActivity.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-[#041B2D]/50 border border-[#428CD4]/10 hover:bg-[#004E9A]/20 hover:border-[#428CD4]/30 transition-colors cursor-default">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm text-[#EAF1F8]">{tx.vendor}</span>
                    <span className="text-xs text-[#428CD4]/70">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm font-medium text-[#FF9CDA] drop-shadow-[0_0_5px_rgba(255,156,218,0.3)]">{tx.amount}</span>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </AntiGravity>
      </div>
    </AntiGravityContainer>
  );
}
