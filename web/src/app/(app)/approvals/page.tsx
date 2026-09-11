'use client';

import { useState } from 'react';
import { Card, Metric, Text, DonutChart, ProgressBar, Flex } from '@tremor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, X, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { POLICY_VAULT_ADDRESS, POLICY_VAULT_ABI } from '@/lib/contracts';
import { AntiGravity, AntiGravityContainer } from '@/components/AntiGravity';

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
        status, 
        timestamp: Number(timestamp) * 1000,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const cardStyle = "bg-[#0A2740] border-[#428CD4]/20 ring-0 shadow-[0_12px_40px_-10px_rgba(0,78,154,0.4)]";

  return (
    <AntiGravityContainer className="space-y-8 max-w-7xl mx-auto pb-10">
      <AntiGravity delay={0}>
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-[#EAF1F8]">Pending Approvals</h2>
          <p className="text-[#428CD4]/70 text-sm mt-1">Review and release escalated payments (Demo: releases via connected wallet instead of Ledger DMK).</p>
        </div>
      </AntiGravity>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AntiGravity delay={0.1}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Approval Status</Text>
            <div className="flex items-center justify-between mt-4">
              {donutData.length > 0 ? (
                <DonutChart
                  className="w-24 h-24"
                  data={donutData}
                  category="value"
                  index="name"
                  colors={["brand", "blue", "red"]}
                  showLabel={false}
                  showAnimation={true}
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center text-[#428CD4]/50 text-sm">No data</div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EA4492]"></div><span className="text-sm text-[#EAF1F8]">{pendingRequests.length} Pending</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#428CD4]"></div><span className="text-sm text-[#EAF1F8]">{approvedCount} Approved</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm text-[#EAF1F8]">{rejectedCount} Rejected</span></div>
              </div>
            </div>
          </Card>
        </AntiGravity>

        <AntiGravity delay={0.2}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">Pending Value</Text>
            <Metric className="text-[#EA4492] font-mono mt-2 drop-shadow-[0_0_10px_rgba(234,68,146,0.5)]">${pendingValue.toFixed(2)}</Metric>
            <Text className="text-[#428CD4]/70 text-sm mt-4">Total USD value of {pendingRequests.length} escalated payment(s).</Text>
          </Card>
        </AntiGravity>

        <AntiGravity delay={0.3}>
          <Card className={cardStyle}>
            <Text className="text-[#428CD4]">This Session</Text>
            <div className="flex justify-between items-end mt-2">
              <Metric className="text-[#EAF1F8] font-mono">${spentUsd.toFixed(2)}</Metric>
              <Text className="text-[#428CD4]/70 text-sm font-mono mb-1">/ ${capUsd.toFixed(2)}</Text>
            </div>
            <ProgressBar value={capUsd > 0 ? (spentUsd / capUsd) * 100 : 0} color="brand" className="mt-4 opacity-80" />
          </Card>
        </AntiGravity>
      </div>

      {/* Approvals Queue */}
      <div className="mt-8">
        {pendingRequests.length === 0 ? (
          <AntiGravity delay={0.4}>
            <Card className="bg-[#041B2D]/40 border border-[#428CD4]/30 border-dashed ring-0 py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#428CD4]/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(66,140,212,0.2)]">
                <CheckCircle2 className="w-8 h-8 text-[#428CD4]" />
              </div>
              <h3 className="text-lg font-display tracking-tight text-[#EAF1F8]">All clear</h3>
              <p className="text-[#428CD4]/70">No payments awaiting approval.</p>
            </Card>
          </AntiGravity>
        ) : (
          <AntiGravityContainer className="space-y-6">
            {pendingRequests.map(req => req && (
              <AntiGravity key={req.id}>
                <Card className="bg-[#0A2740] border-[#428CD4]/20 ring-0 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:shadow-[0_0_20px_rgba(234,68,146,0.15)] hover:border-[#EA4492]/30 hover:-translate-y-[2px] transition-all duration-300">
                  {/* Glow effect on top edge */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--grad-pink)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
                    {/* Left info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#EA4492]/10 text-[#EA4492] hover:bg-[#EA4492]/20 border-[#EA4492]/20 px-3 py-1 text-sm font-medium uppercase tracking-wider font-display">
                          {req.reason}
                        </Badge>
                        <span className="text-[#428CD4]/70 text-sm">{new Date(req.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div>
                        <Text className="text-[#428CD4] mb-1">Vendor Address</Text>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-[#EAF1F8] text-sm bg-[#041B2D] px-2 py-1 rounded border border-[#428CD4]/10">{req.vendor}</p>
                          <button onClick={() => copyToClipboard(req.vendor)} className="p-1.5 rounded bg-[#041B2D] border border-[#428CD4]/10 hover:border-[#428CD4]/50 text-[#428CD4] transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="max-w-xs pt-2">
                        <Flex className="mb-2">
                          <Text className="text-[#428CD4]/70 text-xs">Impact on daily cap</Text>
                          <Text className="text-[#EA4492] font-mono text-xs">+{capUsd > 0 ? ((req.amountUsdRaw / capUsd) * 100).toFixed(1) : 0}%</Text>
                        </Flex>
                        <ProgressBar value={capUsd > 0 ? (req.amountUsdRaw / capUsd) * 100 : 0} color="brand" />
                      </div>
                    </div>
                    
                    {/* Right actions */}
                    <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-[#428CD4]/20 pt-6 md:pt-0 md:pl-6 min-w-[240px]">
                      <div className="mb-6 md:text-right">
                        <Text className="text-[#428CD4] mb-1">Requested Amount</Text>
                        <div className="flex items-baseline gap-2 md:justify-end">
                          <span className="text-4xl font-mono text-[#EAF1F8] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{req.amountUsd}</span>
                        </div>
                        <Text className="text-[#428CD4]/50 font-mono text-xs mt-1">{req.amountWei} WEI</Text>
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                        <Button 
                          variant="outline" 
                          onClick={() => handleReject(req.id)}
                          disabled={signingId !== null}
                          className="flex-1 border-[#428CD4]/30 text-[#428CD4] bg-transparent hover:bg-[#428CD4]/10 hover:text-[#EAF1F8]"
                        >
                          <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          onClick={() => handleApprove(req.id)}
                          disabled={signingId !== null}
                          className="flex-2 bg-[var(--grad-pink)] hover:opacity-90 text-white border-0 shadow-[0_0_15px_rgba(234,68,146,0.4)] hover:shadow-[0_0_25px_rgba(234,68,146,0.6)] transition-all font-display tracking-wide"
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
              </AntiGravity>
            ))}
          </AntiGravityContainer>
        )}
      </div>
    </AntiGravityContainer>
  );
}
