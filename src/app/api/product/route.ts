import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export async function GET() {
  try {
    const product = await prisma.product.findFirst({
      where: { isFeatured: true },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        features: { orderBy: { displayOrder: "asc" } },
        specs: { orderBy: { displayOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Strictly calculate ratings from approved, non-demo reviews only!
    const reviewsAggregate = await prisma.review.aggregate({
      where: {
        productId: product.id,
        status: "APPROVED",
        isDemoData: false,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Rating distribution
    const distributionCounts = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        productId: product.id,
        status: "APPROVED",
        isDemoData: false,
      },
      _count: { id: true },
    });

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionCounts.forEach((item) => {
      ratingDistribution[item.rating] = item._count.id;
    });

    // Get site settings
    const settingsList = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({
      product,
      stats: {
        averageRating: reviewsAggregate._avg.rating
          ? Math.round(reviewsAggregate._avg.rating * 10) / 10
          : null,
        totalApprovedReviews: reviewsAggregate._count.id,
        ratingDistribution,
      },
      settings,
    });
  } catch (err: any) {
    console.error("Product GET error:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, subtitle, description, stockQuantity, isInStock, isFeatured, warrantyInfo, boxContents, metaTitle, metaDescription, images, features, specs } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update main product details
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        description: description !== undefined ? description : existing.description,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : existing.stockQuantity,
        isInStock: isInStock !== undefined ? Boolean(isInStock) : existing.isInStock,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        warrantyInfo: warrantyInfo !== undefined ? warrantyInfo : existing.warrantyInfo,
        boxContents: boxContents !== undefined ? boxContents : existing.boxContents,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      },
    });

    // Track stock change if modified
    if (stockQuantity !== undefined && stockQuantity !== existing.stockQuantity) {
      const change = stockQuantity - existing.stockQuantity;
      await prisma.inventoryHistory.create({
        data: {
          productId: id,
          changeAmount: change,
          reason: "MANUAL_ADJUSTMENT",
          newQuantity: stockQuantity,
          updatedBy: admin.email,
        },
      });
    }

    // Update images if provided
    if (Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: id,
            url: img.url,
            altText: img.altText || `${updated.name} - View ${idx + 1}`,
            displayOrder: idx + 1,
            isThumbnail: idx === 0,
          })),
        });
      }
    }

    // Update features if provided
    if (Array.isArray(features)) {
      await prisma.productFeature.deleteMany({ where: { productId: id } });
      if (features.length > 0) {
        await prisma.productFeature.createMany({
          data: features.map((f: any, idx: number) => ({
            productId: id,
            title: f.title,
            description: f.description,
            icon: f.icon || "Zap",
            displayOrder: idx + 1,
            isVerified: f.isVerified !== undefined ? f.isVerified : true,
          })),
        });
      }
    }

    // Update specs if provided
    if (Array.isArray(specs)) {
      await prisma.productSpec.deleteMany({ where: { productId: id } });
      if (specs.length > 0) {
        await prisma.productSpec.createMany({
          data: specs.map((s: any, idx: number) => ({
            productId: id,
            label: s.label,
            value: s.value,
            category: s.category || "General",
            displayOrder: idx + 1,
            isVerified: s.isVerified !== undefined ? s.isVerified : true,
          })),
        });
      }
    }

    await logAdminAudit(admin.email, "PRODUCT_UPDATE", "Product", id, {
      productName: updated.name,
      stock: updated.stockQuantity,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("Product update error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
