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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Pincode",
      "City",
      "State",
      "Items Count",
      "Original Subtotal",
      "Coupon Discount",
      "Final Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Created At",
    ];

    const rows = orders.map((o) => {
      let addr: any = {};
      try {
        addr = JSON.parse(o.shippingAddressJson);
      } catch {}

      return [
        `"${o.orderNumber}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerEmail}"`,
        `"${o.customerPhone}"`,
        `"${addr.pincode || ""}"`,
        `"${addr.city || ""}"`,
        `"${addr.state || ""}"`,
        o.items.reduce((sum, item) => sum + item.quantity, 0),
        o.originalAmount,
        o.couponDiscount,
        o.finalAmount,
        `"${o.paymentMethod}"`,
        `"${o.paymentStatus}"`,
        `"${o.orderStatus}"`,
        `"${o.createdAt.toISOString()}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
