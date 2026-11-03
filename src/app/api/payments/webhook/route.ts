import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyYoupiWebhookSignature, YoupiWebhookPayload } from "@/lib/youpi";

export async function POST(req: NextRequest) {
  try {
    const signature =
      req.headers.get("x-gateway-signature") || req.headers.get("X-Gateway-Signature");

    // Read raw body as text for HMAC-SHA256 calculation
    const rawBody = await req.text();

    const isValid = verifyYoupiWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Invalid YouPI-PG webhook signature received.");
      return NextResponse.json(
        { error: "Invalid gateway signature" },
        { status: 401 }
      );
    }

    let payload: YoupiWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { event, orderId, paymentId, amount, utr, settlementState } = payload;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in payload" }, { status: 400 });
    }

    // Locate matching order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId }, { id: orderId }],
      },
      include: {
        paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!order) {
      console.warn(`Webhook received for non-existent order: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Exact amount matching
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && Math.abs(parsedAmount - order.finalAmount) > 0.01) {
      console.error(
        `Amount mismatch for order ${order.orderNumber}: expected ${order.finalAmount}, got ${parsedAmount}`
      );
      // Record suspicious payment event
      await prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          paymentAttemptId: order.paymentAttempts[0]?.id || null,
          eventType: "MANUAL_REVIEW",
          signature,
          utr: utr || null,
          amount: parsedAmount,
          settlementState: settlementState || "NOT_RECONCILED",
          rawPayloadJson: rawBody,
          processed: true,
          verificationStatus: "INVESTIGATION",
          verificationNote: `CRITICAL: Amount mismatch. Expected ₹${order.finalAmount}, gateway reported ₹${parsedAmount}.`,
        },
      });

      return NextResponse.json(
        { error: "Payment amount mismatch flagged for investigation" },
        { status: 400 }
      );
    }

    // Idempotency: duplicate check on utr + event type
    if (utr) {
      const existingEvent = await prisma.paymentEvent.findFirst({
        where: {
          orderId: order.id,
          utr,
          eventType: event,
        },
      });

      if (existingEvent) {
        return NextResponse.json({ received: true, deduplicated: true });
      }
    }

    // Record incoming PaymentEvent
    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        orderId: order.id,
        paymentAttemptId: order.paymentAttempts[0]?.id || null,
        eventType: event,
        signature,
        utr: utr || null,
        amount: parsedAmount || order.finalAmount,
        settlementState: settlementState || "NOT_RECONCILED",
        rawPayloadJson: rawBody,
        processed: true,
        verificationStatus: event === "OBSERVED_SUCCESS" ? "PENDING" : "PENDING",
      },
    });

    // Handle lifecycle transitions according to specification:
    // IMPORTANT: Even on OBSERVED_SUCCESS, do NOT mark PAID immediately!
    // Set status to PAYMENT_VERIFICATION for admin manual ledger check.
    if (event === "OBSERVED_SUCCESS" || event === "MANUAL_REVIEW") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PENDING_VERIFICATION",
          orderStatus: "PAYMENT_VERIFICATION",
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.orderStatus,
          toStatus: "PAYMENT_VERIFICATION",
          note: `Webhook received: ${event}. Bank alert observed${
            utr ? ` with UTR ${utr}` : ""
          }. Order awaiting admin bank confirmation.`,
          updatedBy: "YouPI Gateway Webhook",
        },
      });
    } else if (event === "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.orderStatus,
          toStatus: order.orderStatus,
          note: `Webhook received: Payment failed at gateway.`,
          updatedBy: "YouPI Gateway Webhook",
        },
      });
    }

    return NextResponse.json({
      received: true,
      eventId: paymentEvent.id,
      orderStatus: order.orderStatus,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failure" },
      { status: 500 }
    );
  }
}
