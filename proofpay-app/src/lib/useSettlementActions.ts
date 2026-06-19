"use client";

import { useCallback } from "react";
import { useChainEnabled, useWalletAddress } from "./chain";
import {
  createSettlement as createLocal,
  submitDelivery as submitDeliveryLocal,
  submitReview as submitReviewLocal,
  approveAndRelease as approveAndReleaseLocal,
  getSettlement as getLocal,
  saveSettlement as saveLocal,
  DEMO_ID,
} from "./sui";
import {
  useCreateSettlement as useCreateChain,
  useSubmitDelivery as useSubmitDeliveryChain,
  useSubmitReview as useSubmitReviewChain,
  useApproveAndRelease as useApproveAndReleaseChain,
  useSettlement as useFetchChainSettlement,
} from "./chain";
import { AgentWorkSettlement, DeliveryManifest, ReviewResult } from "./types";

export function useSettlementActions() {
  const chainEnabled = useChainEnabled();
  const walletAddress = useWalletAddress();

  const createChain = useCreateChain();
  const submitDeliveryChain = useSubmitDeliveryChain();
  const submitReviewChain = useSubmitReviewChain();
  const approveAndReleaseChain = useApproveAndReleaseChain();
  const fetchChain = useFetchChainSettlement();

  const getSettlement = useCallback(
    async (id: string): Promise<AgentWorkSettlement | undefined> => {
      const local = getLocal(id);

      if (chainEnabled && id.startsWith("0x") && id.length === 66) {
        const chain = await fetchChain(id);
        if (chain) {
          if (local) {
            return { ...local, ...chain, objectId: id };
          }
          return chain;
        }
      }

      return local;
    },
    [chainEnabled, fetchChain]
  );

  const createSettlement = useCallback(
    async (
      input: Omit<AgentWorkSettlement, "id" | "objectId" | "createdAt" | "updatedAt">
    ): Promise<AgentWorkSettlement> => {
      if (chainEnabled && walletAddress) {
        const chain = await createChain({ ...input, client: walletAddress });
        const full = { ...input, ...chain, client: walletAddress };
        if (chain.objectId) {
          saveLocal(chain.objectId, full);
        }
        return full;
      }
      return createLocal({ ...input, client: "0xclient" });
    },
    [chainEnabled, walletAddress, createChain]
  );

  const submitDelivery = useCallback(
    async (
      settlement: AgentWorkSettlement,
      manifest: DeliveryManifest
    ): Promise<AgentWorkSettlement> => {
      if (chainEnabled && settlement.objectId) {
        await submitDeliveryChain(settlement, manifest);
        const chain = await fetchChain(settlement.objectId);
        const merged: AgentWorkSettlement = chain
          ? { ...settlement, ...chain, deliveryManifest: manifest }
          : { ...settlement, deliveryManifest: manifest, status: "submitted" };
        if (settlement.objectId) saveLocal(settlement.objectId, merged);
        return merged;
      }
      return submitDeliveryLocal(settlement.id, manifest);
    },
    [chainEnabled, submitDeliveryChain, fetchChain]
  );

  const submitReview = useCallback(
    async (
      settlement: AgentWorkSettlement,
      review: ReviewResult
    ): Promise<AgentWorkSettlement> => {
      if (chainEnabled && settlement.objectId && settlement.passportObjectId) {
        await submitReviewChain(settlement, review);
        const chain = await fetchChain(settlement.objectId);
        const merged: AgentWorkSettlement = chain
          ? { ...settlement, ...chain, reviewResult: review }
          : { ...settlement, reviewResult: review };
        if (settlement.objectId) saveLocal(settlement.objectId, merged);
        return merged;
      }
      return submitReviewLocal(settlement.id, review);
    },
    [chainEnabled, submitReviewChain, fetchChain]
  );

  const approveAndRelease = useCallback(
    async (settlement: AgentWorkSettlement): Promise<AgentWorkSettlement> => {
      if (chainEnabled && settlement.objectId && settlement.passportObjectId) {
        await approveAndReleaseChain(settlement);
        const chain = await fetchChain(settlement.objectId);
        const merged: AgentWorkSettlement = chain
          ? { ...settlement, ...chain }
          : { ...settlement, status: "released", paymentStatus: "released" };
        if (settlement.objectId) saveLocal(settlement.objectId, merged);
        return merged;
      }
      return approveAndReleaseLocal(settlement.id);
    },
    [chainEnabled, approveAndReleaseChain, fetchChain]
  );

  return {
    chainEnabled,
    walletAddress,
    getSettlement,
    createSettlement,
    submitDelivery,
    submitReview,
    approveAndRelease,
    demoId: DEMO_ID,
  };
}
