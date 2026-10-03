import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const catalog = Object.freeze({
  instant_audit_report: { amount: 29_900, currency: "INR", name: "Instant Audit Report" },
  pro_dpdp_pack: { amount: 99_900, currency: "INR", name: "Pro DPDPA Pack" }
});

function response(res, status, payload) {
  return res.status(status).json(payload);
}

function equalHex(left, right) {
  const a = Buffer.from(left || "", "hex");
  const b = Buffer.from(right || "", "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function getConfig() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null;
  return { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET };
}

async function authenticatedUser(req, config) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return null;
  const client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !data.user) return null;
  return { client, user: data.user };
}

async function createOrder(req, res, config, userContext) {
  const serviceType = req.body?.service_type;
  if (typeof serviceType !== "string" || !Object.hasOwn(catalog, serviceType)) {
    return response(res, 400, { error: "Select a supported service." });
  }
  const product = catalog[serviceType];

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.RAZORPAY_KEY_ID}:${config.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: product.amount,
      currency: product.currency,
      receipt: `0x8acure_${randomUUID().replace(/-/g, "")}`,
      notes: { user_id: userContext.user.id, service_type: serviceType }
    }),
    signal: AbortSignal.timeout(15_000)
  });
  const order = await razorpayResponse.json();
  if (!razorpayResponse.ok) {
    console.error("Razorpay order creation failed.", order?.error?.description || razorpayResponse.status);
    return response(res, 502, { error: "Razorpay could not create the order." });
  }

  const { error } = await userContext.client.from("transactions").insert({
    user_id: userContext.user.id,
    order_id: order.id,
    amount: product.amount,
    currency: product.currency,
    status: "created",
    service_type: serviceType
  });
  if (error) {
    console.error("Could not persist Razorpay order.", error);
    return response(res, 500, { error: "Payment order could not be recorded." });
  }
  return response(res, 201, {
    orderId: order.id, amount: product.amount, currency: product.currency,
    name: product.name, keyId: config.RAZORPAY_KEY_ID
  });
}

async function verifyPayment(req, res, config, userContext) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if ([orderId, paymentId, signature].some((value) => typeof value !== "string" || value.length > 200)) {
    return response(res, 400, { error: "Razorpay payment verification details are incomplete." });
  }
  const expected = createHmac("sha256", config.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  if (!equalHex(signature, expected)) return response(res, 400, { error: "Razorpay payment signature is invalid." });

  const { data: transaction, error: lookupError } = await userContext.client.from("transactions")
    .select("id,order_id,payment_id,amount,currency,status,service_type")
    .eq("user_id", userContext.user.id).eq("order_id", orderId).maybeSingle();
  if (lookupError) return response(res, 500, { error: "Could not load the payment order." });
  if (!transaction) return response(res, 404, { error: "Payment order was not found for this account." });
  if (transaction.status === "paid") {
    if (transaction.payment_id !== paymentId) return response(res, 409, { error: "This order was already completed with a different payment." });
    if (transaction.service_type === "pro_dpdp_pack") {
      const { error } = await userContext.client.from("user_profiles")
        .update({ plan_tier: "pro", updated_at: new Date().toISOString() }).eq("id", userContext.user.id);
      if (error) {
        console.error("Paid Pro pack could not be synchronized to the user profile.", error);
        return response(res, 500, { error: "Payment is recorded, but the Pro plan update needs support review." });
      }
    }
    return response(res, 200, { ok: true, status: "paid", service_type: transaction.service_type });
  }
  if (transaction.status !== "created") return response(res, 409, { error: "This payment order is no longer payable." });

  const gatewayResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${config.RAZORPAY_KEY_ID}:${config.RAZORPAY_KEY_SECRET}`).toString("base64")}` },
    signal: AbortSignal.timeout(15_000)
  });
  const payment = await gatewayResponse.json();
  if (!gatewayResponse.ok || payment.order_id !== orderId || payment.amount !== transaction.amount ||
      payment.currency !== transaction.currency || payment.status !== "captured") {
    return response(res, 402, { error: "Razorpay has not confirmed a captured payment for this order." });
  }

  const { data: updated, error: updateError } = await userContext.client.from("transactions")
    .update({ payment_id: paymentId, status: "paid", updated_at: new Date().toISOString() })
    .eq("id", transaction.id).eq("user_id", userContext.user.id).eq("status", "created").select("id").maybeSingle();
  if (updateError) return response(res, 500, { error: "Could not record the captured payment." });
  if (!updated) return response(res, 409, { error: "Payment status changed while it was being verified. Refresh and check your order history." });

  if (transaction.service_type === "pro_dpdp_pack") {
    const { error } = await userContext.client.from("user_profiles")
      .update({ plan_tier: "pro", updated_at: new Date().toISOString() }).eq("id", userContext.user.id);
    if (error) {
      console.error("Payment is captured but user Pro plan could not be updated.", error);
      return response(res, 500, { error: "Payment was recorded, but the Pro plan update needs support review." });
    }
  }
  return response(res, 200, { ok: true, status: "paid", service_type: transaction.service_type });
}

export async function handleRazorpayRequest(req, res) {
  const config = getConfig();
  if (!config) return response(res, 503, { error: "Supabase and Razorpay server credentials are not configured." });
  const action = req.query?.action || (req.path || "").split("/").pop();
  if (action !== "create-order" && action !== "verify-payment") return response(res, 404, { error: "Payment endpoint not found." });
  let userContext;
  try {
    userContext = await authenticatedUser(req, config);
  } catch (error) {
    console.error("Razorpay endpoint could not validate Supabase session.", error);
    return response(res, 500, { error: "Could not validate the signed-in user." });
  }
  if (!userContext) return response(res, 401, { error: "Sign in with Supabase before starting checkout." });
  try {
    if (action === "create-order" && req.method === "POST") return await createOrder(req, res, config, userContext);
    if (action === "verify-payment" && req.method === "POST") return await verifyPayment(req, res, config, userContext);
    res.set("Allow", "POST");
    return response(res, 405, { error: "Use POST for payment operations." });
  } catch (error) {
    console.error("Razorpay payment request failed.", error);
    return response(res, 502, { error: "Payment service is temporarily unavailable." });
  }
}
