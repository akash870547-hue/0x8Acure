import { handleRazorpayRequest } from "../services/payments/razorpay.js";

export default async function razorpayHandler(req, res) {
  return handleRazorpayRequest(req, res);
}
