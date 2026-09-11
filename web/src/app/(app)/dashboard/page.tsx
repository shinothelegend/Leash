'use client';

import { Card, Metric, Text, AreaChart, BadgeDelta, Flex, ProgressBar } from '@tremor/react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { AntiGravity, AntiGravityContainer } from '@/components/AntiGravity';

const STATUS_MAP = ['Approved', 'Escalated', 'Rejected', 'Released'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved' || status === 'Released') return <Badge className="bg-[#50F0C8]/10 text-[#50F0C8] border-[#50F0C8]/20 font-mono text-xs hover:bg-[#50F0C8]/20">{status}</Badge>;
  if (status === 'Escalated') return <Badge className="bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/20 font-mono text-xs hover:bg-[#7C5CFF]/20">Escalated</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-500/10 text-red-400 font-mono text-xs hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
  return <Badge className="font-mono text-xs">{status}</Badge>;
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
  const startIdx = Math.max(0, count - 15);
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

  const recentActivity = allRecent.slice(0, 5);
  const chartData = [...allRecent].reverse();

  const cardStyle = "bg-[#111116] border-zinc-800/80 ring-0 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:border-[#7C5CFF]/30 transition-all duration-300 rounded-xl";

  return (
    <AntiGravityContainer className="space-y-8 max-w-7xl mx-auto py-8">
      
      <AntiGravity delay={0}>
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-3">
              <Zap className="w-3.5 h-3.5 text-[#3DDCFF]" />
              <span>x402 Spending Firewall Active</span>
            </div>
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl tracking-tight text-white">
              Agent Capacity <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C5CFF] to-[#3DDCFF]">Telemetry</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-[#50F0C8]">
              <span className="w-2 h-2 rounded-full bg-[#50F0C8] animate-ping"></span>
              Hedera Testnet: Connected
            </span>
          </div>
        </div>
      </AntiGravity>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <AntiGravity delay={0.1}>
          <Card className={cardStyle}>
            <Text className="text-zinc-400 text-xs uppercase font-mono tracking-wider">Spent Today</Text>
            <Metric className="text-white font-mono mt-2">${spentUsd.toFixed(2)}</Metric>
            <Flex className="mt-4">
              <Text className="text-zinc-400 text-xs font-mono truncate">{percentSpent.toFixed(1)}% of daily cap</Text>
            </Flex>
            <ProgressBar value={percentSpent} color="purple" className="mt-2 opacity-90" />
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.2}>
          <Card className={cardStyle}>
            <Text className="text-zinc-400 text-xs uppercase font-mono tracking-wider">Daily Policy Cap</Text>
            <Metric className="text-[#3DDCFF] font-mono mt-2">${capUsd.toFixed(2)}</Metric>
            <Flex className="mt-4">
              <Text className="text-zinc-400 text-xs font-mono truncate">Resets in 24h</Text>
            </Flex>
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.3}>
          <Card className={cardStyle}>
            <Text className="text-zinc-400 text-xs uppercase font-mono tracking-wider">Total On-Chain Jobs</Text>
            <Metric className="text-[#7C5CFF] font-mono mt-2">{count}</Metric>
            <Flex className="mt-4">
              <BadgeDelta deltaType="increase" size="xs" className="bg-[#7C5CFF]/15 text-[#7C5CFF] font-mono">x402 Verified</BadgeDelta>
            </Flex>
          </Card>
        </AntiGravity>
        
        <AntiGravity delay={0.4}>
          <Card className={cardStyle}>
            <Text className="text-zinc-400 text-xs uppercase font-mono tracking-wider">Firewall Status</Text>
            <div className="flex items-center gap-2 mt-3">
              <ShieldCheck className="w-7 h-7 text-[#50F0C8] drop-shadow-[0_0_8px_rgba(80,240,200,0.6)]" />
              <Metric className="text-white text-2xl font-mono">ENFORCING</Metric>
            </div>
            <Flex className="mt-4">
              <Text className="text-zinc-500 text-xs font-mono">Ledger DMK Ready</Text>
            </Flex>
          </Card>
        </AntiGravity>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <AntiGravity delay={0.5} className="lg:col-span-2 h-full">
          <Card className={`${cardStyle} h-full min-h-[380px] flex flex-col`}>
            <div className="mb-4">
              <Text className="text-zinc-200 text-base font-semibold tracking-tight">Recent Settlement Volume ($USD over x402)</Text>
            </div>
            
            {chartData.length > 0 ? (
              <AreaChart
                className="h-72 mt-4"
                data={chartData}
                index="timeLabel"
                categories={["amountRaw"]}
                colors={["purple"]}
                valueFormatter={(number) => `$${number.toFixed(2)}`}
                showLegend={false}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Activity className="w-10 h-10 text-zinc-700 mb-3" />
                <Text className="text-zinc-500 text-sm font-mono">Waiting for on-chain telemetry data...</Text>
              </div>
            )}
          </Card>
        </AntiGravity>

        {/* Right Column (Activity) */}
        <AntiGravity delay={0.6} className="lg:col-span-1 h-full">
          <Card className={`${cardStyle} h-full flex flex-col`}>
            <div className="flex justify-between items-center mb-5">
              <Text className="text-zinc-200 text-base font-semibold tracking-tight">Recent Settlements</Text>
              <Link href="/payments" className="text-[#3DDCFF] hover:text-[#7C5CFF] text-xs font-mono flex items-center transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 space-y-3">
              {recentActivity.length === 0 ? (
                 <div className="text-center py-10 text-zinc-600 text-xs font-mono">No recent x402 settlements</div>
              ) : recentActivity.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 hover:border-[#7C5CFF]/40 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs text-zinc-200">{tx.vendor}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-xs font-semibold text-[#3DDCFF]">{tx.amount}</span>
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

