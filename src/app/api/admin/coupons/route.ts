import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, description, discountType, discountValue, maxDiscountAmount, minCartValue, usageLimit, expiresAt, isActive } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description || null,
        discountType: discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        minCartValue: minCartValue ? parseFloat(minCartValue) : 0,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAdminAudit(admin.email, "COUPON_CREATED", "Coupon", coupon.id, {
      code: coupon.code,
      value: coupon.discountValue,
      type: coupon.discountType,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, description, discountType, discountValue, maxDiscountAmount, minCartValue, usageLimit, expiresAt, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        description: description !== undefined ? description : undefined,
        discountType: discountType ? (discountType === "FIXED" ? "FIXED" : "PERCENTAGE") : undefined,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        maxDiscountAmount: maxDiscountAmount !== undefined ? (maxDiscountAmount ? parseFloat(maxDiscountAmount) : null) : undefined,
        minCartValue: minCartValue !== undefined ? parseFloat(minCartValue) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAdminAudit(admin.email, "COUPON_UPDATED", "Coupon", updated.id, {
      code: updated.code,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    await logAdminAudit(admin.email, "COUPON_DELETED", "Coupon", id);

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
