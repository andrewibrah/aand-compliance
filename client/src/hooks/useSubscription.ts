import { useState, useEffect } from "react";

export interface Subscription {
  id: number;
  dealershipId: number;
  plan: "free" | "core" | "managed";
  status: "active" | "inactive" | "canceled";
  currentPeriodEnd: Date | null;
}

export function useSubscription(dealershipId: number | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealershipId) return;

    const loadSubscription = async () => {
      setLoading(true);
      try {
        // TODO: Implement tRPC call to load subscription
        // const result = await trpc.subscription.get.useQuery({ dealershipId });
        // setSubscription(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subscription");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [dealershipId]);

  const isPaid = subscription?.plan === "core" || subscription?.plan === "managed";
  const isActive = subscription?.status === "active";
  const canAccessPremium = isPaid && isActive;

  return {
    subscription,
    loading,
    error,
    isPaid,
    isActive,
    canAccessPremium,
  };
}
