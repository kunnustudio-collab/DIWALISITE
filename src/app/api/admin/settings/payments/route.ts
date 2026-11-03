import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";
import { testYoupiConnection } from "@/lib/youpi";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.paymentSetting.findUnique({
      where: { gatewayName: "YOUPI_PG" },
    });

    // Run connection diagnostics against configured YOUPI_API_URL
    const diagnostics = await testYoupiConnection();

    // Fetch recent payment events & attempts for monitor view
    const [recentAttempts, recentEvents, upiSetting, payeeSetting] = await Promise.all([
      prisma.paymentAttempt.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { order: { select: { orderNumber: true, customerName: true } } },
      }),
      prisma.paymentEvent.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { order: { select: { orderNumber: true, customerName: true } } },
      }),
      prisma.siteSetting.findUnique({ where: { key: "merchant_upi_id" } }),
      prisma.siteSetting.findUnique({ where: { key: "merchant_payee_name" } }),
    ]);

    const merchantUpiId = upiSetting?.value || "BHARATPE09892884396@yesbankltd";
    const merchantPayeeName = payeeSetting?.value || "AquaHome";

    return NextResponse.json({
      settings: {
        ...(settings || {
          gatewayName: "YOUPI_PG",
          isUpiEnabled: true,
          isCodEnabled: true,
          isTestMode: true,
          merchantId: process.env.YOUPI_MERCHANT_ID || "youpi_merchant_demo_01",
          maskedApiKey: "yk_test_••••••••••••3421",
          maskedWebhookSecret: "whsec_test_••••••••••••9812",
          customerReturnUrl: "http://localhost:3000/checkout/verification",
          allowedMethods: "MANUAL_UPI,COD",
        }),
        merchantUpiId,
        merchantPayeeName,
      },
      diagnostics,
      recentAttempts,
      recentEvents,
      environment: {
        youpiApiUrl: process.env.YOUPI_API_URL || "http://localhost:6100",
        configuredMerchantId: process.env.YOUPI_MERCHANT_ID ? "Configured" : "Missing",
        configuredWebhookSecret: process.env.YOUPI_WEBHOOK_SECRET ? "Configured" : "Missing",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load payment settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      isUpiEnabled,
      isCodEnabled,
      isTestMode,
      customerReturnUrl,
      allowedMethods,
      merchantUpiId,
      merchantPayeeName,
    } = body;

    if (merchantUpiId) {
      await prisma.siteSetting.upsert({
        where: { key: "merchant_upi_id" },
        update: { value: merchantUpiId.trim() },
        create: { key: "merchant_upi_id", value: merchantUpiId.trim(), group: "payment" },
      });
    }

    if (merchantPayeeName) {
      await prisma.siteSetting.upsert({
        where: { key: "merchant_payee_name" },
        update: { value: merchantPayeeName.trim() },
        create: { key: "merchant_payee_name", value: merchantPayeeName.trim(), group: "payment" },
      });
    }

    const updated = await prisma.paymentSetting.upsert({
      where: { gatewayName: "YOUPI_PG" },
      update: {
        isUpiEnabled: isUpiEnabled !== undefined ? Boolean(isUpiEnabled) : undefined,
        isCodEnabled: isCodEnabled !== undefined ? Boolean(isCodEnabled) : undefined,
        isTestMode: isTestMode !== undefined ? Boolean(isTestMode) : undefined,
        customerReturnUrl: customerReturnUrl !== undefined ? customerReturnUrl : undefined,
        allowedMethods: allowedMethods !== undefined ? allowedMethods : undefined,
      },
      create: {
        gatewayName: "YOUPI_PG",
        isUpiEnabled: isUpiEnabled !== undefined ? Boolean(isUpiEnabled) : true,
        isCodEnabled: isCodEnabled !== undefined ? Boolean(isCodEnabled) : true,
        isTestMode: isTestMode !== undefined ? Boolean(isTestMode) : true,
        customerReturnUrl: customerReturnUrl || "http://localhost:3000/checkout/verification",
        allowedMethods: allowedMethods || "MANUAL_UPI,COD",
      },
    });

    await logAdminAudit(admin.email, "PAYMENT_SETTINGS_UPDATE", "PaymentSetting", updated.id, {
      isUpiEnabled: updated.isUpiEnabled,
      isCodEnabled: updated.isCodEnabled,
      isTestMode: updated.isTestMode,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 });
  }
}
