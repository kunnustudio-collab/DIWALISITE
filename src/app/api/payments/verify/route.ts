import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, utr, token, action, reason, note } = body;

    const admin = await getAdminFromRequest(req);

    // Find target order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId || "" }, { orderNumber: orderNumber || orderId || "" }],
      },
      include: {
        items: true,
        paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ==========================================
    // PATH A: Customer Submitting UTR Reference
    // ==========================================
    if (!admin) {
      if (!token || token !== order.accessToken) {
        return NextResponse.json(
          { error: "Unauthorized access to order verification" },
          { status: 403 }
        );
      }

      if (!utr || typeof utr !== "string" || utr.trim().length < 6) {
        return NextResponse.json(
          { error: "Please enter a valid 12-digit UPI reference (UTR) number" },
          { status: 400 }
        );
      }

      const cleanUtr = utr.trim();
      const latestAttempt = order.paymentAttempts[0];

      // Record customer UTR submission event
      const event = await prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          paymentAttemptId: latestAttempt?.id || null,
          eventType: "OBSERVED_SUCCESS",
          utr: cleanUtr,
          amount: order.finalAmount,
          settlementState: "NOT_RECONCILED",
          rawPayloadJson: JSON.stringify({
            submittedBy: "customer_checkout",
            utr: cleanUtr,
            timestamp: new Date().toISOString(),
          }),
          verificationStatus: "PENDING",
        },
      });

      // Move order to PAYMENT_VERIFICATION
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "PAYMENT_VERIFICATION",
          paymentStatus: "PENDING_VERIFICATION",
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.orderStatus,
          toStatus: "PAYMENT_VERIFICATION",
          note: `Customer submitted UPI Reference (UTR): ${cleanUtr}. Awaiting bank verification.`,
          updatedBy: "Customer",
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Payment reference submitted successfully. Your transaction is undergoing verification against our bank settlement ledger.",
        orderStatus: "PAYMENT_VERIFICATION",
      });
    }

    // ==========================================
    // PATH B: Admin Manual Verification Decision
    // ==========================================
    if (!action || !["VERIFIED", "REJECTED", "INVESTIGATION"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be VERIFIED, REJECTED, or INVESTIGATION" },
        { status: 400 }
      );
    }

    if (action === "REJECTED" && (!reason || reason.trim().length === 0)) {
      return NextResponse.json(
        { error: "A detailed reason is mandatory when rejecting a payment verification" },
        { status: 400 }
      );
    }

    if (action === "VERIFIED") {
      // Admin confirmed bank receipt of funds
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
        },
      });

      // Update latest payment event if present
      const latestEvent = await prisma.paymentEvent.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestEvent) {
        await prisma.paymentEvent.update({
          where: { id: latestEvent.id },
          data: {
            verificationStatus: "VERIFIED",
            verificationNote: note || "Funds verified in bank account",
            verifiedBy: admin.email,
            verifiedAt: new Date(),
          },
        });
      }

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.orderStatus,
          toStatus: "CONFIRMED",
          note: `Payment verified by administrator ${admin.name} after bank ledger check. Order moved to fulfillment. Note: ${note || "None"}`,
          updatedBy: admin.email,
        },
      });

      await logAdminAudit(admin.email, "PAYMENT_VERIFIED", "Order", order.id, {
        orderNumber: order.orderNumber,
        amount: order.finalAmount,
        note,
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified. Order status updated to CONFIRMED.",
      });
    }

    if (action === "REJECTED") {
      // Mark payment rejected, cancel order, restore product inventory
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "REJECTED",
          orderStatus: "CANCELLED",
          adminNotes: `Payment rejected by ${admin.name}. Reason: ${reason}`,
        },
      });

      // Restore inventory
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            isInStock: true,
          },
        });

        await prisma.inventoryHistory.create({
          data: {
            productId: item.productId,
            changeAmount: item.quantity,
            reason: "PAYMENT_REJECTED_CANCEL",
            newQuantity: 0,
            updatedBy: admin.email,
          },
        });
      }

      const latestEvent = await prisma.paymentEvent.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestEvent) {
        await prisma.paymentEvent.update({
          where: { id: latestEvent.id },
          data: {
            verificationStatus: "REJECTED",
            verificationNote: reason,
            verifiedBy: admin.email,
            verifiedAt: new Date(),
          },
        });
      }

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.orderStatus,
          toStatus: "CANCELLED",
          note: `Payment rejected by ${admin.name}. Reason: ${reason}`,
          updatedBy: admin.email,
        },
      });

      await logAdminAudit(admin.email, "PAYMENT_REJECTED", "Order", order.id, {
        orderNumber: order.orderNumber,
        reason,
      });

      return NextResponse.json({
        success: true,
        message: "Payment rejected and stock returned to inventory.",
      });
    }

    if (action === "INVESTIGATION") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PENDING_VERIFICATION",
          orderStatus: "PAYMENT_VERIFICATION",
          adminNotes: `Marked for investigation by ${admin.name}: ${note || "Bank credit pending or mismatched UTR"}`,
        },
      });

      const latestEvent = await prisma.paymentEvent.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });

      if (latestEvent) {
        await prisma.paymentEvent.update({
          where: { id: latestEvent.id },
          data: {
            verificationStatus: "INVESTIGATION",
            verificationNote: note || "Transaction under bank enquiry",
            verifiedBy: admin.email,
            verifiedAt: new Date(),
          },
        });
      }

      await logAdminAudit(admin.email, "PAYMENT_INVESTIGATION", "Order", order.id, {
        orderNumber: order.orderNumber,
        note,
      });

      return NextResponse.json({
        success: true,
        message: "Payment marked as Under Investigation.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Payment verify error:", err);
    return NextResponse.json(
      { error: err.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
