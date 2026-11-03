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
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            finalAmount: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        addresses: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED")
        .reduce((sum, o) => sum + o.finalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders: c.orders.length,
        totalSpent,
        recentOrders: c.orders.slice(0, 3),
        latestAddress: c.addresses[0] || null,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load customers" }, { status: 500 });
  }
}
