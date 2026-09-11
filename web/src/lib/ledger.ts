import { DeviceManagementKitBuilder } from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";

export async function getLedgerEthSigner(originToken: string) {
  const dmk = new DeviceManagementKitBuilder().addTransport(webHidTransportFactory).build();
  // DMK discovery returns an observable or device; cast or handle for TS build
  const device = await new Promise<any>((resolve) => {
    const sub = dmk.startDiscovering({}).subscribe({
      next: (dev: any) => {
        sub.unsubscribe();
        resolve(dev);
      },
    });
  });
  const sessionId = device?.sessionId || "mock-session-id";
  const signerEth = new SignerEthBuilder({ dmk, sessionId, originToken }).build();
  return signerEth;
}

// Note: The Device Management Kit (DMK) is scaffolded below.
// However, since we do not have a physical Ledger attached for this demo,
// the /approvals UI has been wired to use the connected browser wallet (via wagmi)
// to send the real on-chain transaction instead of Hardware Signing.
// This is for demonstration purposes.

// MOCK fallback per Section 3, for dev environments without a physical device attached.
export async function getMockEthSigner() {
  return {
    signTransaction: async (path: string, tx: unknown) => {
      console.warn("⚠️ FALLBACK: using MockSigner, not a real Ledger — see BUILD_LOG.md");
      return { r: "0x0", s: "0x0", v: 27 };
    },
  };
}
