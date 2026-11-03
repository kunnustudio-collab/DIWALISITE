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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { title: { contains: search } },
        { comment: { contains: search } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          moderationHistory: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Statistics counts
    const [pendingCount, approvedCount, rejectedCount, demoCount] = await Promise.all([
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { status: "APPROVED", isDemoData: false } }),
      prisma.review.count({ where: { status: "REJECTED" } }),
      prisma.review.count({ where: { isDemoData: true } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        demo: demoCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reviewId, action, reason, moderationNote } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "Review ID and action are required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "DELETE") {
      await prisma.review.delete({ where: { id: reviewId } });

      await logAdminAudit(admin.email, "REVIEW_DELETED", "Review", reviewId, {
        customerName: review.customerName,
        rating: review.rating,
      });

      return NextResponse.json({ success: true, message: "Review deleted successfully" });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: newStatus,
        moderatedBy: admin.email,
        moderatedAt: new Date(),
        moderationNote: moderationNote || reason || null,
      },
    });

    await prisma.reviewModerationHistory.create({
      data: {
        reviewId: review.id,
        action: newStatus,
        reason: reason || moderationNote || `Review ${newStatus.toLowerCase()} by ${admin.name}`,
        adminName: admin.name,
      },
    });

    await logAdminAudit(admin.email, `REVIEW_${newStatus}`, "Review", reviewId, {
      customerName: review.customerName,
      rating: review.rating,
      note: moderationNote || reason,
    });

    return NextResponse.json({
      success: true,
      message: `Review ${newStatus.toLowerCase()} successfully`,
      review: updated,
    });
  } catch (err: any) {
    console.error("Review moderation error:", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
