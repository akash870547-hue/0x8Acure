type RazorpayCheckoutCallback = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  order_id?: string;
  subscription_id?: string;
  amount?: number;
  currency?: "INR";
  name: string;
  description: string;
  prefill?: { email?: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutCallback) => void;
  modal: { ondismiss: () => void };
};

interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
}
