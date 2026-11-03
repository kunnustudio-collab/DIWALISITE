import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const admin = await getAdminFromRequest(req);

    // Look up by id OR by orderNumber
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        paymentAttempts: { orderBy: { createdAt: "desc" } },
        paymentEvents: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: unauthenticated customer must provide valid unguessable accessToken
    if (!admin) {
      if (!token || token !== order.accessToken) {
        return NextResponse.json(
          { error: "Access denied. Invalid order tracking token." },
          { status: 403 }
        );
      }

      // Return sanitized customer view (hide admin internal notes)
      return NextResponse.json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          shippingAddress: JSON.parse(order.shippingAddressJson),
          originalAmount: order.originalAmount,
          discountAmount: order.discountAmount,
          couponDiscount: order.couponDiscount,
          shippingFee: order.shippingFee,
          finalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          items: order.items,
          statusHistory: order.statusHistory.map((sh) => ({
            status: sh.toStatus,
            date: sh.createdAt,
            note: sh.note,
          })),
          latestPaymentEvent: order.paymentEvents[0]
            ? {
                eventType: order.paymentEvents[0].eventType,
                utr: order.paymentEvents[0].utr,
                verificationStatus: order.paymentEvents[0].verificationStatus,
              }
            : null,
        },
      });
    }

    // Admin view: complete details
    return NextResponse.json({
      order: {
        ...order,
        shippingAddress: JSON.parse(order.shippingAddressJson),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, paymentStatus, adminNotes, note } = body;

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const fromOrderStatus = existing.orderStatus;
    const newOrderStatus = orderStatus || existing.orderStatus;
    const newPaymentStatus = paymentStatus || existing.paymentStatus;

    // Handle stock restoration if order is cancelled
    if (newOrderStatus === "CANCELLED" && fromOrderStatus !== "CANCELLED") {
      for (const item of existing.items) {
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
            reason: "ORDER_CANCELLED",
            newQuantity: 0, // will reflect in sum
            updatedBy: admin.email,
          },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      },
    });

    // Record immutable status history
    if (newOrderStatus !== fromOrderStatus || note) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: existing.id,
          fromStatus: fromOrderStatus,
          toStatus: newOrderStatus,
          note: note || `Status updated to ${newOrderStatus} by ${admin.name}`,
          updatedBy: admin.email,
        },
      });
    }

    await logAdminAudit(admin.email, "ORDER_UPDATE", "Order", existing.id, {
      fromStatus: fromOrderStatus,
      toStatus: newOrderStatus,
      paymentStatus: newPaymentStatus,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Order PUT error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
