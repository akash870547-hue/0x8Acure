import type { Session } from "@supabase/supabase-js";

export type ServiceType = "instant_audit_report" | "pro_dpdp_pack";
type OrderResponse = { orderId: string; amount: number; currency: "INR"; name: string; keyId?: string };
type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
let sdkPromise: Promise<void> | null = null;

async function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return;
  if (!sdkPromise) {
    sdkPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { sdkPromise = null; reject(new Error("Razorpay Checkout could not be loaded.")); };
      document.head.append(script);
    });
  }
  await sdkPromise;
  if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable in this browser.");
}

async function post<T>(path: string, token: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBase}/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({ error: "Payment server returned an invalid response." }));
  if (!response.ok) throw new Error(result.error || "Payment request failed.");
  return result as T;
}

export async function startCheckout(
  session: Session,
  serviceType: ServiceType,
  onComplete: (result: { service_type: ServiceType }) => void,
  onDismiss: () => void = () => undefined,
  onError: (message: string) => void = (message) => console.error(message)
): Promise<void> {
  if (!session.access_token) throw new Error("Your Supabase session has expired. Sign in again.");
  const order = await post<OrderResponse>("create-order", session.access_token, { service_type: serviceType });
  const keyId = order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("Configure the public Razorpay key ID before opening checkout.");
  await loadRazorpay();
  const checkout = new window.Razorpay!({
    key: keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "0x8Acure",
    description: order.name,
    prefill: { email: session.user.email },
    theme: { color: "#58f2bd" },
    modal: { ondismiss: onDismiss },
    handler: (callback) => {
      if (!callback.razorpay_order_id || !callback.razorpay_payment_id || !callback.razorpay_signature) {
        onError("Razorpay returned incomplete payment verification details.");
        return;
      }
      const response: PaymentResponse = {
        razorpay_order_id: callback.razorpay_order_id,
        razorpay_payment_id: callback.razorpay_payment_id,
        razorpay_signature: callback.razorpay_signature
      };
      void post<{ ok: boolean; status: string; service_type: ServiceType }>(
        "verify-payment", session.access_token, response
      ).then((verified) => {
        if (!verified.ok || verified.status !== "paid") throw new Error("Razorpay has not confirmed this payment.");
        onComplete({ service_type: verified.service_type });
      }).catch((error: unknown) => {
        onError(error instanceof Error ? error.message : "Payment verification failed.");
      });
    }
  });
  checkout.open();
}
