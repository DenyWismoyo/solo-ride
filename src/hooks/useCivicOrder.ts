"use client";

import { useState, useCallback } from "react";
import { civicService, CreateCivicOrderDTO } from "@/services/civic.service";
import { playSuccessChime } from "@/lib/sound";

export function useCivicOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);

  const submitOrder = useCallback(
    async (
      data: CreateCivicOrderDTO,
      options?: { requiresOtp?: boolean }
    ): Promise<string | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        let generatedOtp: string | undefined = undefined;
        if (options?.requiresOtp) {
          generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          data.citizenDetails.otpCode = generatedOtp;
        }

        const orderId = await civicService.createCivicOrder(data);
        setCreatedOrderId(orderId);
        if (generatedOtp) {
          setOtpCode(generatedOtp);
        }

        try {
          playSuccessChime();
        } catch {}

        return orderId;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        console.error("useCivicOrder error:", errorObj);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setCreatedOrderId(null);
    setOtpCode(null);
  }, []);

  return {
    isSubmitting,
    error,
    createdOrderId,
    otpCode,
    submitOrder,
    reset
  };
}
