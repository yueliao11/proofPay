"use client";

import { useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import deployment from "./deployment.json";
import {
  AgentWorkSettlement,
  DeliveryManifest,
  ReviewResult,
  SettlementStatus,
  PaymentStatus,
  TraceBriefPassport,
} from "./types";

const PACKAGE_ID = deployment.packageId;
const CLOCK_ID = "0x0000000000000000000000000000000000000000000000000000000000000006";

// Status constants matching Move contract
const STATUS_FUNDED = 1;
const STATUS_SUBMITTED = 2;
const STATUS_NEEDS_REVISION = 3;
const STATUS_REVIEWED = 4;
const STATUS_RELEASED = 5;

const PAYMENT_LOCKED = 1;
const PAYMENT_READY = 2;
const PAYMENT_RELEASED = 3;

function statusFromChain(status: number): SettlementStatus {
  switch (status) {
    case STATUS_FUNDED:
      return "funded";
    case STATUS_SUBMITTED:
      return "submitted";
    case STATUS_NEEDS_REVISION:
      return "needs_revision";
    case STATUS_REVIEWED:
      return "reviewed";
    case STATUS_RELEASED:
      return "released";
    default:
      return "funded";
  }
}

function paymentStatusFromChain(status: number): PaymentStatus {
  switch (status) {
    case PAYMENT_LOCKED:
      return "locked";
    case PAYMENT_READY:
      return "ready";
    case PAYMENT_RELEASED:
      return "released";
    default:
      return "locked";
  }
}

async function sha256(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

export function useChainEnabled() {
  const account = useCurrentAccount();
  return !!account;
}

export function useWalletAddress(): string | undefined {
  const account = useCurrentAccount();
  return account?.address;
}

export function useCreateSettlement() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  return useCallback(
    async (
      settlement: Omit<AgentWorkSettlement, "id" | "objectId" | "createdAt" | "updatedAt">
    ): Promise<AgentWorkSettlement> => {
      const titleHash = await sha256(settlement.title);
      const descriptionHash = await sha256(settlement.description);
      const criteriaText = settlement.acceptanceCriteria.map((c) => c.text).join("\n");
      const criteriaHash = await sha256(criteriaText);

      const tx = new Transaction();
      tx.setGasBudget(100000000);

      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(settlement.amount * 1_000_000_000)]);

      tx.moveCall({
        target: `${PACKAGE_ID}::proofpay::create_settlement`,
        arguments: [
          tx.pure.address(settlement.agent.address),
          tx.pure(bcs.vector(bcs.U8).serialize(titleHash)),
          tx.pure(bcs.vector(bcs.U8).serialize(descriptionHash)),
          tx.pure(bcs.vector(bcs.U8).serialize(criteriaHash)),
          payment,
          tx.object(CLOCK_ID),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      await client.waitForTransaction({ digest: result.digest });

      const txDetails = await client.getTransactionBlock({
        digest: result.digest,
        options: { showObjectChanges: true },
      });

      const created = (txDetails.objectChanges || []).filter(
        (change) => (change as any).type === "created"
      ) as Array<{ objectId: string; objectType: string }>;
      const settlementObject = created.find((change) =>
        change.objectType?.includes("AgentWorkSettlement")
      );

      const now = new Date().toISOString();
      return {
        ...settlement,
        id: settlementObject?.objectId || `0x${result.digest}`,
        objectId: settlementObject?.objectId,
        createdAt: now,
        updatedAt: now,
      };
    },
    [signAndExecute, client]
  );
}

export function useSubmitDelivery() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  return useCallback(
    async (
      settlement: AgentWorkSettlement,
      manifest: DeliveryManifest
    ): Promise<void> => {
      if (!settlement.objectId) throw new Error("Settlement objectId missing");

      const blobIdBytes = hexToBytes(manifest.blobId);
      const manifestHashBytes = await sha256(manifest.manifestHash);

      const tx = new Transaction();
      tx.setGasBudget(100000000);

      if (settlement.passportObjectId) {
        tx.moveCall({
          target: `${PACKAGE_ID}::proofpay::submit_delivery`,
          arguments: [
            tx.object(settlement.objectId),
            tx.pure(bcs.vector(bcs.U8).serialize(blobIdBytes)),
            tx.pure(bcs.vector(bcs.U8).serialize(manifestHashBytes)),
            tx.object(settlement.passportObjectId),
            tx.object(CLOCK_ID),
          ],
        });
      } else {
        tx.moveCall({
          target: `${PACKAGE_ID}::proofpay::submit_delivery_initial`,
          arguments: [
            tx.object(settlement.objectId),
            tx.pure(bcs.vector(bcs.U8).serialize(blobIdBytes)),
            tx.pure(bcs.vector(bcs.U8).serialize(manifestHashBytes)),
            tx.object(CLOCK_ID),
          ],
        });
      }

      const result = await signAndExecute({ transaction: tx });
      await client.waitForTransaction({ digest: result.digest });

      const txDetails = await client.getTransactionBlock({
        digest: result.digest,
        options: { showObjectChanges: true },
      });

      const created = (txDetails.objectChanges || []).filter(
        (change) => (change as any).type === "created"
      ) as Array<{ objectId: string; objectType: string }>;
      const passportObject = created.find((change) =>
        change.objectType?.includes("TraceBriefPassport")
      );

      if (passportObject) {
        settlement.passportObjectId = passportObject.objectId;
      }
    },
    [signAndExecute, client]
  );
}

export function useSubmitReview() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  return useCallback(
    async (
      settlement: AgentWorkSettlement,
      review: ReviewResult
    ): Promise<void> => {
      if (!settlement.objectId) throw new Error("Settlement objectId missing");
      if (!settlement.passportObjectId) throw new Error("Passport objectId missing");

      const attestationBytes = await sha256(JSON.stringify(review.attestation));
      const reportBlobIdBytes = hexToBytes(review.reviewReportBlobId);

      const tx = new Transaction();
      tx.setGasBudget(100000000);

      tx.moveCall({
        target: `${PACKAGE_ID}::proofpay::submit_review`,
        arguments: [
          tx.object(settlement.objectId),
          tx.object(settlement.passportObjectId),
          tx.pure(bcs.vector(bcs.U8).serialize(attestationBytes)),
          tx.pure.u64(review.score),
          tx.pure(bcs.vector(bcs.U8).serialize(reportBlobIdBytes)),
          tx.object(CLOCK_ID),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      await client.waitForTransaction({ digest: result.digest });
    },
    [signAndExecute, client]
  );
}

export function useApproveAndRelease() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  return useCallback(
    async (settlement: AgentWorkSettlement): Promise<void> => {
      if (!settlement.objectId) throw new Error("Settlement objectId missing");
      if (!settlement.passportObjectId) throw new Error("Passport objectId missing");

      const tx = new Transaction();
      tx.setGasBudget(100000000);

      tx.moveCall({
        target: `${PACKAGE_ID}::proofpay::approve_and_release`,
        arguments: [tx.object(settlement.objectId), tx.object(settlement.passportObjectId)],
      });

      const result = await signAndExecute({ transaction: tx });
      await client.waitForTransaction({ digest: result.digest });
    },
    [signAndExecute, client]
  );
}

export function useSettlement() {
  const client = useSuiClient();

  return useCallback(
    async (objectId: string): Promise<AgentWorkSettlement | undefined> => {
      try {
        const obj = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });

        const content = obj.data?.content;
        if (!content || content.dataType !== "moveObject") return undefined;

        const fields = content.fields as Record<string, unknown>;
        const agentFields = fields.agent as Record<string, string>;

        return {
          id: objectId,
          objectId,
          client: fields.client as string,
          agent: { address: agentFields?.address || "", name: "Agent" },
          amount: Number(fields.escrow) / 1_000_000_000,
          asset: "SUI",
          title: "",
          description: "",
          acceptanceCriteria: [],
          acceptanceCriteriaHash: "",
          status: statusFromChain(Number(fields.status)),
          paymentStatus: paymentStatusFromChain(Number(fields.payment_status)),
          passportId: (fields.passport_id as string) || undefined,
          createdAt: new Date(Number(fields.created_at_ms)).toISOString(),
          updatedAt: new Date(Number(fields.updated_at_ms)).toISOString(),
        };
      } catch {
        return undefined;
      }
    },
    [client]
  );
}

export function usePassport() {
  const client = useSuiClient();

  return useCallback(
    async (objectId: string): Promise<TraceBriefPassport | undefined> => {
      try {
        const obj = await client.getObject({
          id: objectId,
          options: { showContent: true },
        });

        const content = obj.data?.content;
        if (!content || content.dataType !== "moveObject") return undefined;

        const fields = content.fields as Record<string, unknown>;
        const agentFields = fields.agent as Record<string, string>;

        return {
          id: objectId,
          settlementId: (fields.settlement_id as string) || "",
          agent: { address: agentFields?.address || "", name: "Agent" },
          escrowAmount: Number(fields.escrow_amount) / 1_000_000_000,
          paymentStatus: paymentStatusFromChain(Number(fields.payment_status)),
          deliverableBlobId: "",
          deliverableManifestHash: "",
          acceptanceCriteriaHash: "",
          reviewScore: Number(fields.review_score),
          createdAt: new Date(Number(fields.created_at_ms)).toISOString(),
          updatedAt: new Date(Number(fields.updated_at_ms)).toISOString(),
        };
      } catch {
        return undefined;
      }
    },
    [client]
  );
}
