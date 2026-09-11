'use client';

import { useState } from 'react';
import { Card, Metric, Text, DonutChart, ProgressBar, Flex } from '@tremor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, X, HardDrive, CheckCircle2, Loader2 } from 'lucide-react';
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';

export default function ApprovalsPage() {
  const [signingId, setSigningId] = useState<string | null>(null);

  const { data: paymentsCount } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'paymentsCount',
  });

  const { data: dailyCap } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'dailyCapUsdCents',
  });

  const { data: spentToday } = useReadContract({
    address: POLICY_VAULT_ADDRESS,
    abi: POLICY_VAULT_ABI,
    functionName: 'spentTodayUsdCents',
  });

  const capUsd = dailyCap ? Number(dailyCap) / 100 : 0;
  const spentUsd = spentToday ? Number(spentToday) / 100 : 0;

  const count = Number(paymentsCount || 0n);
  // Fetch up to the last 50 payments to find escalated ones
  const limit = Math.min(50, count);
  const startIdx = Math.max(0, count - limit);
  const paymentIndices = Array.from({ length: limit }, (_, i) => BigInt(startIdx + i)).reverse();

  const { data: paymentsData, refetch } = useReadContracts({
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
        amountWei: amountWei.toString(),
        amountUsd: `$${(Number(amountUsdCents) / 100).toFixed(2)}`,
        amountUsdRaw: Number(amountUsdCents) / 100,
        status, // 0 = Approved, 1 = Escalated, 2 = Rejected, 3 = Released
        timestamp: Number(timestamp) * 1000,
        // The struct doesn't return the reason, so we just infer from status
        reason: 'Policy Escalation',
      };
    }
    return null;
  }).filter(Boolean) || [];

  const pendingRequests = allPayments.filter(p => p?.status === 1);
  const approvedCount = allPayments.filter(p => p?.status === 0 || p?.status === 3).length;
  const rejectedCount = allPayments.filter(p => p?.status === 2).length;

  const donutData = [
    { name: 'Pending', value: pendingRequests.length },
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
  ].filter(d => d.value > 0);

  const pendingValue = pendingRequests.reduce((acc, p) => acc + (p?.amountUsdRaw || 0), 0);

  const { writeContract, data: txHash } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash });

  // Refetch when transaction confirms
  if (txHash && !isWaiting && signingId) {
    setSigningId(null);
    refetch();
  }

  const handleApprove = (id: string) => {
    setSigningId(id);
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'releasePayment',
      args: [BigInt(id)],
    });
  };

  const handleReject = (id: string) => {
    setSigningId(id);
    writeContract({
      address: POLICY_VAULT_ADDRESS,
      abi: POLICY_VAULT_ABI,
      functionName: 'rejectPayment',
      args: [BigInt(id), "Rejected by admin"],
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Pending Approvals</h2>
        <p className="text-zinc-400 text-sm mt-1">Review and release escalated payments (Demo: releases via connected wallet instead of Ledger DMK).</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <Text className="text-zinc-400">Approval Status</Text>
          <div className="flex items-center justify-between mt-4">
            {donutData.length > 0 ? (
              <DonutChart
                className="w-24 h-24"
                data={donutData}
                category="value"
                index="name"
                colors={["amber", "emerald", "red"]}
                showLabel={false}
                showAnimation={true}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-zinc-600 text-sm">No data</div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm text-zinc-300">{pendingRequests.length} Pending</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm text-zinc-300">{approvedCount} Approved</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-zinc-300">{rejectedCount} Rejected</span></div>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <Text className="text-zinc-400">Pending Value</Text>
          <Metric className="text-amber-500 font-mono mt-2">${pendingValue.toFixed(2)}</Metric>
          <Text className="text-zinc-500 text-sm mt-4">Total USD value of {pendingRequests.length} escalated payment(s).</Text>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 ring-0 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <Text className="text-zinc-400">This Session</Text>
          <div className="flex justify-between items-end mt-2">
            <Metric className="text-emerald-500 font-mono">${spentUsd.toFixed(2)}</Metric>
            <Text className="text-zinc-500 text-sm font-mono mb-1">/ ${capUsd.toFixed(2)}</Text>
          </div>
          <ProgressBar value={capUsd > 0 ? (spentUsd / capUsd) * 100 : 0} color="emerald" className="mt-4" />
        </Card>
      </div>

      {/* Approvals Queue */}
      <div className="mt-8">
        {pendingRequests.length === 0 ? (
          <Card className="bg-zinc-900/30 border border-zinc-800/50 border-dashed ring-0 py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-300">All clear</h3>
            <p className="text-zinc-500">No payments awaiting approval.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map(req => req && (
              <Card key={req.id} className="bg-zinc-900/80 border-zinc-800 ring-0 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-50"></div>
                
                <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
                  {/* Left info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 px-3 py-1 text-sm font-medium">
                        {req.reason}
                      </Badge>
                      <span className="text-zinc-500 text-sm">{new Date(req.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div>
                      <Text className="text-zinc-400 mb-1">Vendor</Text>
                      <p className="font-mono text-zinc-200">{req.vendor}</p>
                    </div>

                    <div className="max-w-xs">
                      <Flex className="mb-2">
                        <Text className="text-zinc-400 text-xs">Impact on daily cap</Text>
                        <Text className="text-amber-500 font-mono text-xs">+{capUsd > 0 ? ((req.amountUsdRaw / capUsd) * 100).toFixed(1) : 0}%</Text>
                      </Flex>
                      <ProgressBar value={capUsd > 0 ? (req.amountUsdRaw / capUsd) * 100 : 0} color="amber" />
                    </div>
                  </div>
                  
                  {/* Right actions */}
                  <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-6 min-w-[240px]">
                    <div className="mb-6 md:text-right">
                      <Text className="text-zinc-400 mb-1">Requested Amount</Text>
                      <div className="flex items-baseline gap-2 md:justify-end">
                        <span className="text-4xl font-mono text-zinc-100">{req.amountUsd}</span>
                      </div>
                      <Text className="text-zinc-500 font-mono text-xs mt-1">{req.amountWei} WEI</Text>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(req.id)}
                        disabled={signingId !== null}
                        className="flex-1 border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button 
                        onClick={() => handleApprove(req.id)}
                        disabled={signingId !== null}
                        className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        {signingId === req.id ? (
                          <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing...</span>
                        ) : (
                          <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Approve & Release</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
