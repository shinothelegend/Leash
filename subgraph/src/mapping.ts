import { PaymentApproved, PaymentEscalated, PaymentRejected, PaymentReleased } from "../generated/PolicyVault/PolicyVault";
import { Vendor, PaymentEvent } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

function loadOrCreateVendor(address: string): Vendor {
  let v = Vendor.load(address);
  if (!v) {
    v = new Vendor(address);
    v.approvedCount = 0;
    v.escalatedCount = 0;
    v.rejectedCount = 0;
    v.totalReleasedWei = BigInt.zero();
    v.reputationScore = 0;
  }
  return v;
}

export function handlePaymentApproved(event: PaymentApproved): void {
  let v = loadOrCreateVendor(event.params.vendor.toHexString());
  v.approvedCount += 1;
  let score = v.approvedCount - v.escalatedCount * 2 - v.rejectedCount * 3;
  v.reputationScore = score < 0 ? 0 : score;
  v.save();

  let p = new PaymentEvent(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  p.paymentId = event.params.id;
  p.vendor = v.id;
  p.amountWei = event.params.amountWei;
  p.amountUsdCents = event.params.amountUsdCents;
  p.status = "Approved";
  p.timestamp = event.block.timestamp;
  p.save();
}

export function handlePaymentEscalated(event: PaymentEscalated): void {
  let v = loadOrCreateVendor(event.params.vendor.toHexString());
  v.escalatedCount += 1;
  let score = v.approvedCount - v.escalatedCount * 2 - v.rejectedCount * 3;
  v.reputationScore = score < 0 ? 0 : score;
  v.save();

  let p = new PaymentEvent(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  p.paymentId = event.params.id;
  p.vendor = v.id;
  p.amountWei = event.params.amountWei;
  p.amountUsdCents = event.params.amountUsdCents;
  p.status = "Escalated";
  p.timestamp = event.block.timestamp;
  p.save();
}

export function handlePaymentRejected(event: PaymentRejected): void {
  let v = loadOrCreateVendor(event.params.vendor.toHexString());
  v.rejectedCount += 1;
  let score = v.approvedCount - v.escalatedCount * 2 - v.rejectedCount * 3;
  v.reputationScore = score < 0 ? 0 : score;
  v.save();

  let p = new PaymentEvent(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  p.paymentId = event.params.id;
  p.vendor = v.id;
  p.amountWei = BigInt.zero();
  p.amountUsdCents = BigInt.zero();
  p.status = "Rejected";
  p.timestamp = event.block.timestamp;
  p.save();
}

export function handlePaymentReleased(event: PaymentReleased): void {
  let v = loadOrCreateVendor(event.params.vendor.toHexString());
  v.totalReleasedWei = v.totalReleasedWei.plus(event.params.amountWei);
  v.save();

  let p = new PaymentEvent(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
  p.paymentId = event.params.id;
  p.vendor = v.id;
  p.amountWei = event.params.amountWei;
  p.amountUsdCents = BigInt.zero();
  p.status = "Released";
  p.timestamp = event.block.timestamp;
  p.save();
}
