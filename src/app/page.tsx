import React from "react";
import { prisma } from "@/lib/prisma";
import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { Header } from "@/components/storefront/Header";
import { ProductHero } from "@/components/storefront/ProductHero";
import { BenefitsSection } from "@/components/storefront/BenefitsSection";
import { ProductDetailsSection } from "@/components/storefront/ProductDetailsSection";
import { WhyBuyFromUsSection } from "@/components/storefront/WhyBuyFromUsSection";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import { FaqSection } from "@/components/storefront/FaqSection";
import { FinalCtaSection } from "@/components/storefront/FinalCtaSection";
import { Footer } from "@/components/storefront/Footer";

// Revalidate page dynamically
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch Product with images, features, specs
  const product = await prisma.product.findFirst({
    where: { isFeatured: true },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      features: { orderBy: { displayOrder: "asc" } },
      specs: { orderBy: { displayOrder: "asc" } },
    },
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow border border-slate-200 max-w-md">
          <h1 className="text-xl font-bold text-slate-800">Product Initializing</h1>
          <p className="text-sm text-slate-600 mt-2">
            The store catalog is setting up. Please ensure database seed has completed.
          </p>
        </div>
      </div>
    );
  }

  // 2. Fetch Review Aggregates (Strictly Approved, Non-Demo Only!)
  const reviewsAggregate = await prisma.review.aggregate({
    where: {
      productId: product.id,
      status: "APPROVED",
      isDemoData: false,
    },
    _avg: { rating: true },
    _count: { id: true },
  });

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

  // Approved reviews list for customer display
  const approvedReviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      status: "APPROVED",
      isDemoData: false,
    },
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
    take: 6,
  });

  // 3. Fetch Site Settings
  const settingsList = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  settingsList.forEach((s) => (settings[s.key] = s.value));

  // 4. Fetch FAQs
  const faqs = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const stats = {
    averageRating: reviewsAggregate._avg.rating
      ? Math.round(reviewsAggregate._avg.rating * 10) / 10
      : null,
    totalApprovedReviews: reviewsAggregate._count.id,
    ratingDistribution,
  };

  const formattedReviews = approvedReviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar
        text={settings["announcement_text"]}
        enabled={settings["announcement_enabled"] !== "false"}
        link={settings["announcement_link"] || "#product-overview"}
      />

      {/* Main Header */}
      <Header
        storeName={settings["store_name"]}
        supportPhone={settings["support_phone"]}
      />

      <main className="flex-1">
        {/* Product Hero */}
        <ProductHero
          product={product}
          stats={stats}
          deliveryDays={settings["estimated_delivery_days"]}
        />

        {/* Benefits & Verified Features */}
        <BenefitsSection features={product.features} />

        {/* Product Technical Details & Safety Precautions */}
        <ProductDetailsSection
          description={product.description}
          specs={product.specs}
          boxContents={product.boxContents}
          warrantyInfo={product.warrantyInfo}
        />

        {/* Why Buy From Us */}
        <WhyBuyFromUsSection />

        {/* Customer Reviews & Moderated Submissions */}
        <ReviewsSection
          initialReviews={formattedReviews}
          stats={stats}
        />

        {/* FAQs */}
        <FaqSection faqs={faqs} />

        {/* Final CTA Purchase Box */}
        <FinalCtaSection product={product} />
      </main>

      {/* Footer */}
      <Footer
        storeName={settings["store_name"]}
        supportEmail={settings["support_email"]}
        supportPhone={settings["support_phone"]}
        supportWhatsapp={settings["support_whatsapp"]}
        businessAddress={settings["business_address"]}
        sellerDisclaimer={settings["seller_disclaimer"]}
      />
    </div>
  );
}
