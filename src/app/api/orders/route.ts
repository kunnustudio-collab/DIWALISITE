import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOrderPricing } from "@/lib/pricing";
import { createYoupiPaymentSession } from "@/lib/youpi";
import { validateIndianPhone, validateIndianPincode, sanitizeText } from "@/lib/utils";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      houseNumber,
      street,
      landmark,
      city,
      state,
      pincode,
      quantity = 1,
      paymentMethod = "UPI",
      couponCode,
    } = body;

    // 1. Validate customer & address inputs
    if (!fullName || !email || !phone || !houseNumber || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Please fill in all required delivery details" },
        { status: 400 }
      );
    }

    if (!validateIndianPhone(phone)) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    if (!validateIndianPincode(pincode)) {
      return NextResponse.json(
        { error: "Please provide a valid 6-digit Indian PIN code" },
        { status: 400 }
      );
    }

    // 2. Validate payment method settings
    const paymentSettings = await prisma.paymentSetting.findUnique({
      where: { gatewayName: "YOUPI_PG" },
    });

    const isUpi = paymentMethod.toUpperCase() === "UPI";
    const isCod = paymentMethod.toUpperCase() === "COD";

    if (isUpi && paymentSettings && !paymentSettings.isUpiEnabled) {
      return NextResponse.json(
        { error: "UPI payments are currently unavailable" },
        { status: 400 }
      );
    }

    if (isCod && paymentSettings && !paymentSettings.isCodEnabled) {
      return NextResponse.json(
        { error: "Cash on Delivery is currently unavailable" },
        { status: 400 }
      );
    }

    // 3. Server-side pricing calculation & stock verification
    const pricing = await calculateOrderPricing({
      quantity,
      couponCode,
    });

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const shippingAddress = {
      fullName: sanitizeText(fullName),
      phone: cleanPhone,
      houseNumber: sanitizeText(houseNumber),
      street: sanitizeText(street),
      landmark: landmark ? sanitizeText(landmark) : "",
      city: sanitizeText(city),
      state: sanitizeText(state),
      pincode: pincode.trim(),
    };

    // 4. Atomic database transaction
    const order = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = await tx.customer.findUnique({
        where: { email: cleanEmail },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: sanitizeText(fullName),
            email: cleanEmail,
            phone: cleanPhone,
          },
        });
      }

      // Save address
      await tx.address.create({
        data: {
          customerId: customer.id,
          ...shippingAddress,
          isDefault: true,
        },
      });

      // Decrement product stock
      const updatedProduct = await tx.product.update({
        where: { id: pricing.product.id },
        data: {
          stockQuantity: { decrement: pricing.quantity },
          isInStock: pricing.product.stockQuantity - pricing.quantity > 0,
        },
      });

      // Record inventory change
      await tx.inventoryHistory.create({
        data: {
          productId: pricing.product.id,
          changeAmount: -pricing.quantity,
          reason: "ORDER_PLACED",
          newQuantity: updatedProduct.stockQuantity,
          updatedBy: "Customer Checkout",
        },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: sanitizeText(fullName),
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          shippingAddressJson: JSON.stringify(shippingAddress),
          originalAmount: pricing.originalSubtotal,
          discountAmount: pricing.productDiscountTotal,
          couponDiscount: pricing.couponDiscount,
          shippingFee: pricing.shippingFee,
          finalAmount: pricing.finalPayableAmount,
          paymentMethod: isUpi ? "UPI" : "COD",
          paymentStatus: "PENDING",
          orderStatus: isUpi ? "PAYMENT_PENDING" : "CONFIRMED",
        },
      });

      // Create Order Item
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: pricing.product.id,
          productName: pricing.product.name,
          unitPrice: pricing.product.sellingPrice,
          quantity: pricing.quantity,
          totalAmount: pricing.sellingSubtotal,
        },
      });

      // If coupon used, track usage
      if (pricing.couponApplied) {
        const coupon = await tx.coupon.findUnique({
          where: { code: pricing.couponApplied.code },
        });

        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { timesUsed: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              orderId: newOrder.id,
              customerEmail: cleanEmail,
              discountApplied: pricing.couponDiscount,
            },
          });
        }
      }

      // Initial Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: "NONE",
          toStatus: isUpi ? "PAYMENT_PENDING" : "CONFIRMED",
          note: isUpi
            ? "Order created. Awaiting UPI payment session completion."
            : "Cash on delivery order confirmed.",
          updatedBy: "Customer Checkout",
        },
      });

      return newOrder;
    });

    // 5. Initiate YouPI-PG session if UPI
    let checkoutUrl = `/checkout/success?orderNumber=${order.orderNumber}&token=${order.accessToken}`;
    let paymentAttemptId = null;

    if (isUpi) {
      const idempotencyKey = `idemp_${order.id}_${Date.now()}`;
      const appBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const returnUrl = `${appBaseUrl}/checkout/verification?orderId=${order.orderNumber}&token=${order.accessToken}`;

      const youpiRes = await createYoupiPaymentSession({
        orderId: order.orderNumber,
        amount: order.finalAmount,
        currency: "INR",
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        returnUrl,
        idempotencyKey,
      });

      const attempt = await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          idempotencyKey,
          gateway: "YOUPI_PG",
          gatewayPaymentId: youpiRes.paymentId,
          checkoutUrl: youpiRes.checkoutUrl,
          amount: order.finalAmount,
          currency: "INR",
          status: "ACTIVE",
          rawResponseJson: JSON.stringify(youpiRes),
        },
      });

      paymentAttemptId = attempt.id;
      checkoutUrl = youpiRes.checkoutUrl;
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
      },
      checkoutUrl,
      paymentAttemptId,
    });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "ALL") {
      where.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
          paymentEvents: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
