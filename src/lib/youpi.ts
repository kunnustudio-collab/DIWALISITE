import crypto from "node:crypto";
import { prisma } from "./prisma";

export interface YoupiCreatePaymentRequest {
  orderId: string;
  amount: number; // e.g. 1499
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  idempotencyKey: string;
}

export interface YoupiCreatePaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  amount: string;
  status: string;
  checkoutUrl: string;
  isTestFallback?: boolean;
  error?: string;
}

export interface YoupiWebhookPayload {
  event: "OBSERVED_SUCCESS" | "RECONCILED" | "MANUAL_REVIEW" | "SUCCESS" | "FAILED" | string;
  settlementState?: "NOT_RECONCILED" | "RECONCILED" | string;
  orderId: string;
  paymentId?: string;
  amount: string;
  amountPaise?: number;
  utr?: string;
  method?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Creates a payment session with YouPI-PG (POST /api/v1/payments).
 * Follows the official YouPI-PG REST API specification.
 */
export async function createYoupiPaymentSession(
  params: YoupiCreatePaymentRequest
): Promise<YoupiCreatePaymentResponse> {
  const apiUrl = process.env.YOUPI_API_URL || "http://localhost:6100";
  const merchantId = process.env.YOUPI_MERCHANT_ID || "youpi_merchant_live";
  const formattedAmount = params.amount.toFixed(2); // "1499.00"

  const requestBody = {
    orderId: params.orderId,
    amount: formattedAmount,
    currency: params.currency || "INR",
    returnUrl: params.returnUrl,
    metadata: {
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Merchant-Id": merchantId,
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        paymentId: data.paymentId || `pay_${crypto.randomBytes(8).toString("hex")}`,
        orderId: params.orderId,
        amount: data.amount || formattedAmount,
        status: data.status || "ACTIVE",
        checkoutUrl: data.checkoutUrl,
      };
    }
    console.warn(`YouPI-PG server returned HTTP ${res.status}. Falling back to test checkout mode.`);
  } catch (err: any) {
    console.warn(
      `YouPI-PG gateway at ${apiUrl} unreachable (${err.message}). Using test sandbox flow.`
    );
  }

  // Graceful test mode simulation (conforms to YouPI Manual UPI specification)
  // Generates a local checkout session URL where customer views the dynamic UPI QR & submits UTR
  const simulatedPaymentId = `youpi_test_${crypto.randomBytes(8).toString("hex")}`;
  const localCheckoutUrl = `/checkout/verification?orderId=${encodeURIComponent(
    params.orderId
  )}&paymentId=${encodeURIComponent(simulatedPaymentId)}&mode=test`;

  return {
    success: true,
    paymentId: simulatedPaymentId,
    orderId: params.orderId,
    amount: formattedAmount,
    status: "ACTIVE",
    checkoutUrl: localCheckoutUrl,
    isTestFallback: true,
  };
}

/**
 * Validates the HMAC-SHA256 signature sent in the x-gateway-signature header.
 * Must be computed against the raw unparsed request body string/buffer.
 */
export function verifyYoupiWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secretOverride?: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const secret = secretOverride || process.env.YOUPI_WEBHOOK_SECRET || "whsec_test_secret_for_hmac_sha256_validation";

  // Expected format: "sha256=<hex>" or raw hex
  const cleanSignature = signatureHeader.startsWith("sha256=")
    ? signatureHeader.substring(7).trim()
    : signatureHeader.trim();

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const computedHash = hmac.digest("hex");

  try {
    const signatureBuffer = Buffer.from(cleanSignature, "hex");
    const computedBuffer = Buffer.from(computedHash, "hex");

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
  } catch {
    return false;
  }
}

/**
 * Diagnostic utility to test YouPI-PG gateway health & reachability.
 */
export async function testYoupiConnection(): Promise<{
  reachable: boolean;
  apiUrl: string;
  statusText: string;
  latencyMs: number;
}> {
  const apiUrl = process.env.YOUPI_API_URL || "http://localhost:6100";
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/health`, {
      method: "GET",
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (res) {
      return {
        reachable: res.ok,
        apiUrl,
        statusText: `Responded with HTTP ${res.status}`,
        latencyMs,
      };
    }

    return {
      reachable: false,
      apiUrl,
      statusText: "Connection refused (Gateway offline or not started)",
      latencyMs,
    };
  } catch (err: any) {
    return {
      reachable: false,
      apiUrl,
      statusText: err.message || "Failed to reach host",
      latencyMs: Date.now() - start,
    };
  }
}
