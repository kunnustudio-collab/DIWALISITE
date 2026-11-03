import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, cartAmount } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const subtotal = parseFloat(cartAmount) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit has been reached" }, { status: 400 });
    }

    if (subtotal < coupon.minCartValue) {
      return NextResponse.json(
        {
          error: `Minimum order value of ₹${coupon.minCartValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const raw = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    discountAmount = Math.round(discountAmount);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
