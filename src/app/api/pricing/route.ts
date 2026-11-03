import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export async function GET() {
  try {
    const product = await prisma.product.findFirst({
      where: { isFeatured: true },
      select: {
        id: true,
        name: true,
        originalPrice: true,
        sellingPrice: true,
        discountPercentage: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ pricing: product });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, originalPrice, sellingPrice } = await req.json();

    const origPrice = parseFloat(originalPrice);
    const sellPrice = parseFloat(sellingPrice);

    if (isNaN(origPrice) || origPrice <= 0) {
      return NextResponse.json({ error: "Original price must be greater than 0" }, { status: 400 });
    }
    if (isNaN(sellPrice) || sellPrice <= 0) {
      return NextResponse.json({ error: "Selling price must be greater than 0" }, { status: 400 });
    }
    if (sellPrice > origPrice) {
      return NextResponse.json(
        { error: "Selling price cannot exceed the original MRP" },
        { status: 400 }
      );
    }

    const discountPercentage = Math.round(((origPrice - sellPrice) / origPrice) * 100);

    const targetProduct = productId
      ? await prisma.product.findUnique({ where: { id: productId } })
      : await prisma.product.findFirst({ where: { isFeatured: true } });

    if (!targetProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: targetProduct.id },
      data: {
        originalPrice: origPrice,
        sellingPrice: sellPrice,
        discountPercentage,
      },
    });

    await logAdminAudit(admin.email, "PRICE_UPDATE", "Product", updated.id, {
      fromOriginal: targetProduct.originalPrice,
      toOriginal: origPrice,
      fromSelling: targetProduct.sellingPrice,
      toSelling: sellPrice,
      discountPercentage,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updated.id,
        originalPrice: updated.originalPrice,
        sellingPrice: updated.sellingPrice,
        discountPercentage: updated.discountPercentage,
      },
    });
  } catch (err: any) {
    console.error("Pricing update error:", err);
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 });
  }
}
