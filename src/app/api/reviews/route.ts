import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const product = await prisma.product.findFirst({
      where: { isFeatured: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // STRICT RULE: Only genuine, approved, non-demo reviews on public website!
    const where = {
      productId: product.id,
      status: "APPROVED",
      isDemoData: false,
    };

    const [reviews, totalCount, aggregate, distribution] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          customerName: true,
          rating: true,
          title: true,
          comment: true,
          imageUrl: true,
          isVerifiedPurchase: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where,
        _count: { id: true },
      }),
    ]);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((item) => {
      ratingDistribution[item.rating] = item._count.id;
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: aggregate._avg.rating
          ? Math.round(aggregate._avg.rating * 10) / 10
          : 0,
        totalReviews: totalCount,
        ratingDistribution,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, rating, title, comment, imageUrl } = body;

    // 1. Validation
    if (!name || !email || !title || !comment || !rating) {
      return NextResponse.json(
        { error: "Please fill in all review fields" },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = sanitizeText(name.trim());
    const cleanTitle = sanitizeText(title.trim());
    const cleanComment = sanitizeText(comment.trim());

    // 2. Anti-spam check: prevent multiple submissions within 5 minutes from same email
    const recentReview = await prisma.review.findFirst({
      where: {
        customerEmail: cleanEmail,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
    });

    if (recentReview) {
      return NextResponse.json(
        { error: "You recently submitted a review. Please wait a few minutes before submitting again." },
        { status: 429 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { isFeatured: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3. Independent verification of verified buyer status
    // Only marked true if there is an actual completed purchase record for this email
    const completedPurchase = await prisma.order.findFirst({
      where: {
        customerEmail: cleanEmail,
        OR: [{ paymentStatus: "PAID" }, { orderStatus: "DELIVERED" }],
      },
    });

    const isVerifiedPurchase = Boolean(completedPurchase);

    // 4. Create review with PENDING status (requires admin moderation)
    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        customerName: cleanName,
        customerEmail: cleanEmail,
        rating: numRating,
        title: cleanTitle,
        comment: cleanComment,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        isVerifiedPurchase,
        status: "PENDING",
        isDemoData: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback. Your review will appear after moderation.",
      reviewId: newReview.id,
    });
  } catch (err: any) {
    console.error("Review POST error:", err);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
