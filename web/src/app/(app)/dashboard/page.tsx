'use client';

import { Card, Metric, Text, DonutChart, AreaChart, BadgeDelta, Flex, ProgressBar } from '@tremor/react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Activity, Loader2 } from 'lucide-react';
import { useReadContract, useReadContracts } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';

const STATUS_MAP = ['Approved', 'Escalated', 'Rejected', 'Released'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved' || status === 'Released') return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{status}</Badge>;
  if (status === 'Escalated') return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Escalated</Badge>;
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

  // We need to construct an array of calls for the last up to 5 payments
  const count = Number(paymentsCount || 0n);
  const startIdx = Math.max(0, count - 5);
  const paymentIndices = Array.from({ length: Math.min(5, count) }, (_, i) => BigInt(startIdx + i)).reverse();

  const { data: recentPaymentsData } = useReadContracts({
    contracts: paymentIndices.map(idx => ({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'payments',
      args: [idx],
    })),
  });

  const recentActivity = recentPaymentsData?.map((result, i) => {
    if (result.status === 'success' && result.result) {
      const [vendor, amountWei, amountUsdCents, status, timestamp, resource] = result.result as unknown as [string, bigint, bigint, number, bigint, string];
      return {
        id: paymentIndices[i].toString(),
        vendor: `${vendor.slice(0,6)}...${vendor.slice(-4)}`,
        amount: `$${(Number(amountUsdCents) / 100).toFixed(2)}`,
        status: STATUS_MAP[status],
        timestamp: Number(timestamp) * 1000,
      };
    }
    return null;
  }).filter(Boolean) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-shadow">
          <Text className="text-zinc-400">Spent Today</Text>
          <Metric className="text-zinc-100 font-mono">${spentUsd.toFixed(2)}</Metric>
          <Flex className="mt-4">
            <Text className="text-zinc-500 text-xs truncate">{percentSpent.toFixed(1)}% of daily cap</Text>
          </Flex>
          <ProgressBar value={percentSpent} color="indigo" className="mt-2" />
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-shadow">
          <Text className="text-zinc-400">Daily Cap</Text>
          <Metric className="text-zinc-100 font-mono">${capUsd.toFixed(2)}</Metric>
          <Flex className="mt-4">
            <Text className="text-zinc-500 text-xs truncate">Resets in 24h</Text>
          </Flex>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-shadow">
          <Text className="text-zinc-400">Total Payments</Text>
          <Metric className="text-indigo-400 font-mono">{count}</Metric>
          <Flex className="mt-4">
            <BadgeDelta deltaType="increase" size="xs" className="bg-indigo-500/10 text-indigo-500">Tracked on-chain</BadgeDelta>
          </Flex>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] transition-shadow">
          <Text className="text-zinc-400">Agent Status</Text>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="w-8 h-8 text-emerald-500" />
            <Metric className="text-zinc-100">Active</Metric>
          </div>
          <Flex className="mt-4">
            <Text className="text-zinc-500 text-xs">Monitoring payments...</Text>
          </Flex>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-full flex flex-col items-center justify-center min-h-[300px]">
            <Activity className="w-12 h-12 text-zinc-800 mb-4" />
            <Text className="text-zinc-500">Historical spend chart disabled.</Text>
            <Text className="text-zinc-600 text-sm mt-2">Waiting for subgraph indexing to populate time-series data.</Text>
          </Card>
        </div>

        {/* Right Column (Activity) */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <Text className="text-zinc-400">Recent Activity</Text>
              <Link href="/payments" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center transition-colors">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 space-y-4">
              {recentActivity.length === 0 ? (
                 <div className="text-center py-8 text-zinc-500 text-sm">No recent payments</div>
              ) : recentActivity.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm text-zinc-300">{tx.vendor}</span>
                    <span className="text-xs text-zinc-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm font-medium text-zinc-100">{tx.amount}</span>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
