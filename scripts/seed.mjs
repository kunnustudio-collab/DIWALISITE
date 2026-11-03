import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Initial Admin
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@aquathermal.store";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "AdminSecurePassword2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Store Administrator",
      role: "super_admin",
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Store Administrator",
      role: "super_admin",
      isActive: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Product
  const originalPrice = 2190;
  const sellingPrice = 1499;
  const discountPercentage = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  const product = await prisma.product.upsert({
    where: { slug: "havells-zella-immersion-rod-1000w-blue" },
    update: {
      name: "Havells Zella Immersion Rod 1000W (Blue)",
      brand: "Havells",
      modelName: "Zella",
      subtitle: "Instant Water Heater with Smart Bucket Hanger & Thermal Cut-Off",
      description: `The Havells Zella 1000W Immersion Water Heater in elegant Blue offers efficient, rapid water heating for winter mornings. Engineered with a durable nickel-plated heating element for superior corrosion resistance and prolonged lifespan, it features an intelligent dual-purpose collapsible flap that serves as a protective cover and secure bucket hanger. Integrated with a temperature setting knob (Low, Medium, High) and an automatic thermal cut-off mechanism for enhanced safety, it is an essential, energy-efficient winter companion.`,
      originalPrice,
      sellingPrice,
      discountPercentage,
      stockQuantity: 45,
      isInStock: true,
      isFeatured: true,
      warrantyInfo: "2 Years Manufacturer Warranty covering manufacturing defects.",
      boxContents: "1 N Immersion Rod, 1 N Collapsible Bucket Hanger (Pre-fitted), 1 N User Manual & Warranty Card",
      metaTitle: "Havells Zella 1000W Immersion Rod (Blue) - Buy Online at Best Price",
      metaDescription: "Buy genuine Havells Zella 1000W Immersion Rod in Blue. Features temperature control knob, nickel-plated element, thermal cut-off, and 2-year warranty.",
    },
    create: {
      slug: "havells-zella-immersion-rod-1000w-blue",
      name: "Havells Zella Immersion Rod 1000W (Blue)",
      brand: "Havells",
      modelName: "Zella",
      subtitle: "Instant Water Heater with Smart Bucket Hanger & Thermal Cut-Off",
      description: `The Havells Zella 1000W Immersion Water Heater in elegant Blue offers efficient, rapid water heating for winter mornings. Engineered with a durable nickel-plated heating element for superior corrosion resistance and prolonged lifespan, it features an intelligent dual-purpose collapsible flap that serves as a protective cover and secure bucket hanger. Integrated with a temperature setting knob (Low, Medium, High) and an automatic thermal cut-off mechanism for enhanced safety, it is an essential, energy-efficient winter companion.`,
      originalPrice,
      sellingPrice,
      discountPercentage,
      stockQuantity: 45,
      isInStock: true,
      isFeatured: true,
      warrantyInfo: "2 Years Manufacturer Warranty covering manufacturing defects.",
      boxContents: "1 N Immersion Rod, 1 N Collapsible Bucket Hanger (Pre-fitted), 1 N User Manual & Warranty Card",
      metaTitle: "Havells Zella 1000W Immersion Rod (Blue) - Buy Online at Best Price",
      metaDescription: "Buy genuine Havells Zella 1000W Immersion Rod in Blue. Features temperature control knob, nickel-plated element, thermal cut-off, and 2-year warranty.",
    },
  });
  console.log(`✅ Product seeded: ${product.name}`);

  // 3. Product Images
  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.createMany({
    data: [
      {
        productId: product.id,
        url: "/images/havells-zella-hero.jpg",
        altText: "Havells Zella 1000W Immersion Rod - Dual View Folded & Deployed in Water Splash",
        displayOrder: 1,
        isThumbnail: true,
      },
      {
        productId: product.id,
        url: "/images/havells-zella-features-infographic.jpg",
        altText: "Havells Zella Infographic - Adjustable Heat Settings, Heating Element & Durable Build",
        displayOrder: 2,
        isThumbnail: false,
      },
      {
        productId: product.id,
        url: "/images/havells-zella-safety-lifestyle.jpg",
        altText: "Havells Zella Lifestyle - Safe, Fast & Energy Efficient with Heavy Duty 3-Pin Plug",
        displayOrder: 3,
        isThumbnail: false,
      },
      {
        productId: product.id,
        url: "/images/zella-opened-hanger.jpg",
        altText: "Havells Zella with Open Bucket Hanger Flaps and Nickel Coils",
        displayOrder: 4,
        isThumbnail: false,
      },
      {
        productId: product.id,
        url: "/images/zella-folded-body.jpg",
        altText: "Havells Zella Compact Folded Body with Indicator Window",
        displayOrder: 5,
        isThumbnail: false,
      },
      {
        productId: product.id,
        url: "/images/zella-dial-knob.jpg",
        altText: "Havells Zella Rotary Temperature Setting Dial (Low, Medium, High)",
        displayOrder: 6,
        isThumbnail: false,
      },
      {
        productId: product.id,
        url: "/images/zella-nickel-coils.jpg",
        altText: "Heavy-Duty Nickel Plated Heating Coils and Water Level Shaft",
        displayOrder: 7,
        isThumbnail: false,
      },
    ],
  });

  // 4. Product Features (Verified specs only)
  await prisma.productFeature.deleteMany({ where: { productId: product.id } });
  await prisma.productFeature.createMany({
    data: [
      {
        productId: product.id,
        title: "1000W Rapid Heating",
        description: "Optimized power consumption delivering rapid water warming within 10-15 minutes for standard buckets.",
        icon: "Zap",
        displayOrder: 1,
        isVerified: true,
      },
      {
        productId: product.id,
        title: "Nickel-Plated Element",
        description: "Heavy copper tube protected by nickel plating to prevent mineral scale accumulation and oxidation.",
        icon: "Shield",
        displayOrder: 2,
        isVerified: true,
      },
      {
        productId: product.id,
        title: "Adjustable Temperature Knob",
        description: "Rotate between Low, Medium, and High settings to achieve your preferred water temperature comfortably.",
        icon: "Sliders",
        displayOrder: 3,
        isVerified: true,
      },
      {
        productId: product.id,
        title: "Thermal Cut-Off Safety",
        description: "Built-in automatic thermal cut-off mechanism that shuts off power if preset safety thresholds are met.",
        icon: "ShieldCheck",
        displayOrder: 4,
        isVerified: true,
      },
      {
        productId: product.id,
        title: "Smart Collapsible Flap",
        description: "Dual-utility flap serves as a protective element guard and safe bucket edge hanger.",
        icon: "CheckCircle",
        displayOrder: 5,
        isVerified: true,
      },
      {
        productId: product.id,
        title: "Heating Indicator Light",
        description: "Bright visual neon indicator confirms power flow and active heating status at a glance.",
        icon: "Lightbulb",
        displayOrder: 6,
        isVerified: true,
      },
    ],
  });

  // 5. Technical Specifications
  await prisma.productSpec.deleteMany({ where: { productId: product.id } });
  await prisma.productSpec.createMany({
    data: [
      { productId: product.id, label: "Brand", value: "Havells", category: "General", displayOrder: 1, isVerified: true },
      { productId: product.id, label: "Model Name", value: "Zella", category: "General", displayOrder: 2, isVerified: true },
      { productId: product.id, label: "Color", value: "Electric Blue & Black", category: "General", displayOrder: 3, isVerified: true },
      { productId: product.id, label: "Type", value: "Immersion Water Heater", category: "General", displayOrder: 4, isVerified: true },
      { productId: product.id, label: "Power Consumption", value: "1000 Watts", category: "Electrical", displayOrder: 5, isVerified: true },
      { productId: product.id, label: "Operating Voltage", value: "230 V AC, 50 Hz", category: "Electrical", displayOrder: 6, isVerified: true },
      { productId: product.id, label: "Plug Type", value: "Heavy-Duty 3-Pin Molded Plug (16A recommended)", category: "Electrical", displayOrder: 7, isVerified: true },
      { productId: product.id, label: "Heating Element Material", value: "Nickel Plated Copper Tube", category: "Build", displayOrder: 8, isVerified: true },
      { productId: product.id, label: "Mounting Style", value: "Vertical Bucket Hanger (Collapsible)", category: "Build", displayOrder: 9, isVerified: true },
      { productId: product.id, label: "Indicator", value: "Power / Heating Neon Lamp", category: "Build", displayOrder: 10, isVerified: true },
      { productId: product.id, label: "Safety Mechanism", value: "Automatic Thermal Cut-Off", category: "Safety", displayOrder: 11, isVerified: true },
      { productId: product.id, label: "Water Level Indicators", value: "Minimum & Maximum Level Embossed", category: "Safety", displayOrder: 12, isVerified: true },
      { productId: product.id, label: "Standard Certification", value: "ISI Marked (BIS Certified)", category: "Safety", displayOrder: 13, isVerified: true },
      { productId: product.id, label: "Warranty", value: "2 Years Manufacturer Warranty", category: "General", displayOrder: 14, isVerified: true },
    ],
  });

  // 6. Site Settings
  const defaultSettings = [
    { key: "store_name", value: "AquaHome", group: "branding" },
    { key: "store_tagline", value: "Smart Home Essentials", group: "branding" },
    { key: "logo_url", value: "", group: "branding" },
    { key: "brand_color", value: "#0284c7", group: "branding" },
    { key: "seller_disclaimer", value: "AquaHome Smart Home Essentials is an authorized independent retail stockist. 'Havells' and 'Zella' are registered trademarks of Havells India Ltd. This store is independently operated and not owned or endorsed by Havells India Ltd.", group: "branding" },
    { key: "support_email", value: "care@aquahome.store", group: "contact" },
    { key: "support_phone", value: "+91 98765 43210", group: "contact" },
    { key: "support_whatsapp", value: "+919876543210", group: "contact" },
    { key: "business_address", value: "Plot 42, Electronics Zone, Phase IV, Gurgaon, Haryana 122016, India", group: "contact" },
    { key: "announcement_enabled", value: "true", group: "announcement" },
    { key: "announcement_text", value: "Winter Special Offer - Get Flat ₹200 OFF on Your Order!", group: "announcement" },
    { key: "announcement_link", value: "#hero-buy", group: "announcement" },
    { key: "shipping_fee", value: "0", group: "general" },
    { key: "estimated_delivery_days", value: "2 to 4 Business Days", group: "general" },
    { key: "merchant_upi_id", value: "BHARATPE09892884396@yesbankltd", group: "payment" },
    { key: "merchant_payee_name", value: "AquaHome", group: "payment" },
    { key: "merchant_qr_image", value: "/images/bharatpe-qr.jpg", group: "payment" },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: { key: s.key, value: s.value, group: s.group },
    });
  }

  // 7. Site Content (CMS Policies and Sections)
  const defaultContents = [
    {
      sectionKey: "hero",
      title: "Havells Zella 1000W Immersion Rod",
      contentJson: JSON.stringify({
        badge: "100% Genuine Sealed Unit",
        headline: "Instant Hot Water Every Winter Morning",
        subheadline: "Equipped with advanced nickel-plated heating element, adjustable temperature dial, and safety thermal cut-off.",
        uspList: [
          "1000W Power-Efficient Heating",
          "Durable Nickel Plated Element",
          "Smart Bucket Hanger Guard",
          "2-Year Havells Manufacturer Warranty"
        ],
      }),
    },
    {
      sectionKey: "why_buy_us",
      title: "Why Buy From AquaThermal?",
      contentJson: JSON.stringify({
        points: [
          {
            title: "100% Original Sealed Box",
            description: "Direct from verified authorized distributor supply chains with tamper-proof seal.",
            icon: "ShieldCheck",
          },
          {
            title: "2-Year Manufacturer Warranty",
            description: "Genuine warranty card with brand service center coverage across 500+ Indian cities.",
            icon: "Award",
          },
          {
            title: "Express 48-Hour Dispatch",
            description: "Orders safely packaged in shockproof bubble casing and dispatched via BlueDart & Delhivery.",
            icon: "Truck",
          },
          {
            title: "Transparent & Safe Checkout",
            description: "Zero surprise fees. Pay securely via UPI (YouPI-PG) or opt for Cash on Delivery.",
            icon: "Lock",
          },
        ],
      }),
    },
    {
      sectionKey: "safety_guide",
      title: "Safe Usage Guidelines & Instructions",
      contentJson: JSON.stringify({
        steps: [
          "Place the immersion rod vertically inside the bucket using the collapsible hanger.",
          "Ensure water is strictly between the MIN and MAX embossed water level markings before plugging in.",
          "Plug into an earthed 3-pin power socket (16A rated recommended) and switch ON.",
          "The neon heating lamp will illuminate. Adjust temperature dial as preferred.",
          "IMPORTANT: Never touch water or bucket when the immersion rod is plugged into power.",
          "Always switch off power and unplug socket before removing the rod or drawing water.",
        ],
      }),
    },
    {
      sectionKey: "policy_privacy",
      title: "Privacy Policy",
      contentJson: JSON.stringify({
        body: "We value customer privacy. Customer shipping addresses and contact details are used solely for order fulfilment, tracking updates, and delivery verification. We do not sell or trade your personal information.",
      }),
    },
    {
      sectionKey: "policy_terms",
      title: "Terms and Conditions",
      contentJson: JSON.stringify({
        body: "By placing an order on AquaThermal Essentials, you confirm that your delivery details are accurate. Product specifications are provided based on manufacturer packaging. All disputes subject to Gurgaon jurisdiction.",
      }),
    },
    {
      sectionKey: "policy_shipping",
      title: "Shipping Policy",
      contentJson: JSON.stringify({
        body: "We offer free standard express delivery across all serviceable Indian pincodes. Orders are processed within 24 hours of verification and delivered within 2-4 business days with live courier tracking.",
      }),
    },
    {
      sectionKey: "policy_refund",
      title: "Cancellation & Refund Policy",
      contentJson: JSON.stringify({
        body: "Orders can be cancelled before dispatch for a 100% full refund. In case of transit damage or manufacturing defect, report within 48 hours with an unboxing video for an instant replacement or refund.",
      }),
    },
  ];

  for (const c of defaultContents) {
    await prisma.siteContent.upsert({
      where: { sectionKey: c.sectionKey },
      update: { title: c.title, contentJson: c.contentJson },
      create: { sectionKey: c.sectionKey, title: c.title, contentJson: c.contentJson },
    });
  }

  // 8. FAQs
  await prisma.faqItem.deleteMany({});
  await prisma.faqItem.createMany({
    data: [
      {
        question: "How much electricity does the 1000W Havells Zella consume?",
        answer: "At 1000 Watts (1 kW), continuous operation for 1 hour consumes exactly 1 unit (1 kWh) of electricity. Since heating a 15-20 liter bucket typically takes 10 to 15 minutes, each heating session uses only approximately 0.2 to 0.25 units (under ₹2 in most electricity tariff slabs).",
        displayOrder: 1,
        isActive: true,
      },
      {
        question: "How long does it take to heat water?",
        answer: "In standard room-temperature conditions (15°C to 20°C), a standard 15 to 20-liter bucket warms to comfortable bathing temperature (~40°C) in approximately 10 to 15 minutes. Note that heating speed varies based on initial bucket water temperature and bucket volume.",
        displayOrder: 2,
        isActive: true,
      },
      {
        question: "What is included inside the box?",
        answer: "The sealed retail pack includes: 1 Unit Havells Zella 1000W Immersion Rod with pre-fitted smart collapsible bucket hanger, 3-pin power cord, and 1 Official User Manual with Manufacturer Warranty Card.",
        displayOrder: 3,
        isActive: true,
      },
      {
        question: "What is the warranty and how do I claim it?",
        answer: "The product carries an authentic 2-Year Havells Manufacturer Warranty against manufacturing defects. You can register your invoice on the Havells website or call Havells customer care toll-free (1800-103-1313) for doorstep service support.",
        displayOrder: 4,
        isActive: true,
      },
      {
        question: "Which payment options are available?",
        answer: "We support direct UPI payment (Google Pay, PhonePe, Paytm, BHIM, CRED) via YouPI-PG as well as Cash on Delivery (COD). For UPI orders, your payment reference/UTR is verified before dispatch.",
        displayOrder: 5,
        isActive: true,
      },
      {
        question: "How do I track my order status?",
        answer: "Once your order is placed, you receive a unique order tracking link with an unguessable access token. You can also visit our Order Tracking page anytime and enter your Order ID and mobile number.",
        displayOrder: 6,
        isActive: true,
      },
    ],
  });

  // 9. Coupons
  await prisma.coupon.upsert({
    where: { code: "WARMTH100" },
    update: {
      description: "Flat ₹100 Off on your winter purchase",
      discountType: "FIXED",
      discountValue: 100,
      minCartValue: 1200,
      isActive: true,
      usageLimit: 500,
    },
    create: {
      code: "WARMTH100",
      description: "Flat ₹100 Off on your winter purchase",
      discountType: "FIXED",
      discountValue: 100,
      minCartValue: 1200,
      isActive: true,
      usageLimit: 500,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WINTER10" },
    update: {
      description: "10% Discount up to ₹200",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscountAmount: 200,
      minCartValue: 1000,
      isActive: true,
      usageLimit: 250,
    },
    create: {
      code: "WINTER10",
      description: "10% Discount up to ₹200",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscountAmount: 200,
      minCartValue: 1000,
      isActive: true,
      usageLimit: 250,
    },
  });

  // 10. Payment Gateway Settings
  await prisma.paymentSetting.upsert({
    where: { gatewayName: "YOUPI_PG" },
    update: {
      isUpiEnabled: true,
      isCodEnabled: true,
      isTestMode: false,
      merchantId: process.env.YOUPI_MERCHANT_ID || "youpi_merchant_live",
      maskedApiKey: "yk_live_••••••••••••3421",
      maskedWebhookSecret: "whsec_live_••••••••••••9812",
      customerReturnUrl: "http://localhost:9090/checkout/verification",
      allowedMethods: "MANUAL_UPI,COD",
    },
    create: {
      gatewayName: "YOUPI_PG",
      isUpiEnabled: true,
      isCodEnabled: true,
      isTestMode: false,
      merchantId: process.env.YOUPI_MERCHANT_ID || "youpi_merchant_live",
      maskedApiKey: "yk_live_••••••••••••3421",
      maskedWebhookSecret: "whsec_live_••••••••••••9812",
      customerReturnUrl: "http://localhost:9090/checkout/verification",
      allowedMethods: "MANUAL_UPI,COD",
    },
  });

  // 11. DEMO REVIEWS ONLY in development seed data
  // Strictly isolated: isDemoData = true, status = "PENDING".
  // NEVER shown on storefront. Admin moderation sees them with [DEMO DATA] badge.
  await prisma.review.deleteMany({ where: { isDemoData: true } });
  await prisma.review.createMany({
    data: [
      {
        productId: product.id,
        customerName: "Rahul Sharma (Demo Seed)",
        customerEmail: "rahul.demo@example.com",
        rating: 5,
        title: "Heats 20L bucket in 12 minutes! (Demo Seed Record)",
        comment: "This is a demonstration seed record for administrative testing purposes only. Solid nickel build and the bucket hanger is very sturdy.",
        isVerifiedPurchase: false,
        status: "PENDING",
        isDemoData: true,
        moderationNote: "Seed demo record. Kept in PENDING to ensure zero public rating impact.",
      },
      {
        productId: product.id,
        customerName: "Pooja Verma (Demo Seed)",
        customerEmail: "pooja.demo@example.com",
        rating: 4,
        title: "Good temperature dial control (Demo Seed Record)",
        comment: "Demonstration seed record. The heat indicator light works well. Great product for chilly mornings.",
        isVerifiedPurchase: false,
        status: "PENDING",
        isDemoData: true,
        moderationNote: "Seed demo record for moderation testing.",
      },
      {
        productId: product.id,
        customerName: "Amitabh Sen (Demo Seed)",
        customerEmail: "amitabh.demo@example.com",
        rating: 5,
        title: "Proper Havells quality (Demo Seed Record)",
        comment: "Demonstration seed record. Very safe build with water level indicators.",
        isVerifiedPurchase: false,
        status: "PENDING",
        isDemoData: true,
        moderationNote: "Seed demo record.",
      },
      {
        productId: product.id,
        customerName: "Vikram Mehta (Demo Seed)",
        customerEmail: "vikram.demo@example.com",
        rating: 4,
        title: "Quick delivery and original pack (Demo Seed Record)",
        comment: "Demonstration seed record. Genuine retail packing with warranty card inside.",
        isVerifiedPurchase: false,
        status: "PENDING",
        isDemoData: true,
        moderationNote: "Seed demo record.",
      },
      {
        productId: product.id,
        customerName: "Sneha Nair (Demo Seed)",
        customerEmail: "sneha.demo@example.com",
        rating: 5,
        title: "Compact and easy to store (Demo Seed Record)",
        comment: "Demonstration seed record. Foldable hook makes it easy to hang on standard buckets.",
        isVerifiedPurchase: false,
        status: "PENDING",
        isDemoData: true,
        moderationNote: "Seed demo record.",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
