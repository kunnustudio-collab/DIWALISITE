import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      pendingVerificationOrders,
      completedOrders,
      cancelledOrders,
      product,
      publishedReviews,
      pendingReviews,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: {
          OR: [{ paymentStatus: "PAID" }, { orderStatus: "DELIVERED" }],
        },
        select: { finalAmount: true },
      }),
      prisma.order.count({
        where: { orderStatus: { in: ["PENDING", "PAYMENT_PENDING"] } },
      }),
      prisma.order.count({
        where: { orderStatus: "PAYMENT_VERIFICATION" },
      }),
      prisma.order.count({
        where: { orderStatus: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      }),
      prisma.order.count({
        where: { orderStatus: "CANCELLED" },
      }),
      prisma.product.findFirst({
        where: { isFeatured: true },
        select: { id: true, name: true, stockQuantity: true, isInStock: true, sellingPrice: true },
      }),
      prisma.review.count({
        where: { status: "APPROVED", isDemoData: false },
      }),
      prisma.review.count({
        where: { status: "PENDING" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 7,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          finalAmount: true,
          paymentMethod: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        pendingVerificationOrders,
        completedOrders,
        cancelledOrders,
        stockQuantity: product?.stockQuantity || 0,
        isInStock: product?.isInStock || false,
        publishedReviews,
        pendingReviews,
      },
      product,
      recentOrders,
    });
  } catch (err: any) {
    console.error("Dashboard metrics error:", err);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
