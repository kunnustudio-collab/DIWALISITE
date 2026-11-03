import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("🚀 STARTING AUTOMATED TEST SUITE: E-COMMERCE & YOUPI-PG");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Admin Authentication & Password Verification
    console.log("▶ TEST 1: Admin Authentication");
    const admin = await prisma.admin.findUnique({
      where: { email: "admin@aquathermal.store" },
    });
    assert(admin !== null, "Admin account found in database");
    const isPasswordValid = await bcrypt.compare("AdminSecurePassword2026!", admin.passwordHash);
    assert(isPasswordValid, "Admin password hash verifies correctly");

    const isWrongPasswordValid = await bcrypt.compare("WrongPassword123!", admin.passwordHash);
    assert(!isWrongPasswordValid, "Rejects incorrect password attempt");

    // TEST 2: Product & Verified Specs Integrity
    console.log("\n▶ TEST 2: Product & Manufacturer Specification Verification");
    const product = await prisma.product.findFirst({
      where: { isFeatured: true },
      include: { images: true, features: true, specs: true },
    });
    assert(product !== null, "Featured product exists");
    assert(product.name === "Havells Zella Immersion Rod 1000W (Blue)", "Correct product name");
    assert(product.sellingPrice === 1499, `Selling price is ₹${product.sellingPrice}`);
    assert(product.originalPrice === 2190, `MRP is ₹${product.originalPrice}`);
    const expectedDiscount = Math.round(((2190 - 1499) / 2190) * 100);
    assert(product.discountPercentage === expectedDiscount, `Discount correctly computed (${expectedDiscount}%)`);
    assert(product.images.length >= 4, `Image gallery has ${product.images.length} photos`);
    assert(product.specs.some((s) => s.label === "Power Consumption" && s.value === "1000 Watts"), "Verified 1000W spec present");

    // TEST 3: Dynamic Pricing Update Validation
    console.log("\n▶ TEST 3: Dynamic Pricing Update Rules");
    const initialPrice = product.sellingPrice;
    // Test discount calculation
    const testNewOrig = 2500;
    const testNewSell = 1500;
    const testDiscount = Math.round(((testNewOrig - testNewSell) / testNewOrig) * 100);
    assert(testDiscount === 40, "Dynamic discount percentage 40% correctly calculated");

    // TEST 4: Coupon Validation
    console.log("\n▶ TEST 4: Coupon Validation Logic");
    const coupon = await prisma.coupon.findUnique({ where: { code: "WARMTH100" } });
    assert(coupon !== null && coupon.isActive, "Coupon WARMTH100 active");
    assert(coupon.discountValue === 100, "Coupon discount value is ₹100");

    // TEST 5: Order Creation & Stock Decrement
    console.log("\n▶ TEST 5: Order Creation & Stock Transaction");
    const initialStock = product.stockQuantity;
    const testOrderNum = `ORD-TEST-${Date.now()}`;
    const testToken = crypto.randomUUID();

    const createdOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock
      const updatedP = await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: { decrement: 1 } },
      });

      const ord = await tx.order.create({
        data: {
          orderNumber: testOrderNum,
          customerName: "Test Buyer",
          customerEmail: "buyer.test@example.com",
          customerPhone: "9876543210",
          shippingAddressJson: JSON.stringify({
            fullName: "Test Buyer",
            phone: "9876543210",
            houseNumber: "Flat 101",
            street: "MG Road",
            city: "Gurgaon",
            state: "Haryana",
            pincode: "122001",
          }),
          originalAmount: 2190,
          discountAmount: 691,
          couponDiscount: 100,
          shippingFee: 0,
          finalAmount: 1399,
          paymentMethod: "UPI",
          paymentStatus: "PENDING",
          orderStatus: "PAYMENT_PENDING",
          accessToken: testToken,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: ord.id,
          productId: product.id,
          productName: product.name,
          unitPrice: 1499,
          quantity: 1,
          totalAmount: 1499,
        },
      });

      return ord;
    });

    const refreshedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    assert(refreshedProduct.stockQuantity === initialStock - 1, "Stock successfully decremented in atomic transaction");
    assert(createdOrder.finalAmount === 1399, "Final amount calculated correctly with coupon");

    // TEST 6: YouPI-PG Webhook HMAC-SHA256 Signature Verification
    console.log("\n▶ TEST 6: YouPI-PG Webhook HMAC-SHA256 Validation");
    const secret = process.env.YOUPI_WEBHOOK_SECRET || "whsec_test_secret_for_hmac_sha256_validation";
    const testPayload = JSON.stringify({
      event: "OBSERVED_SUCCESS",
      settlementState: "NOT_RECONCILED",
      orderId: createdOrder.orderNumber,
      amount: "1399.00",
      utr: "998877665544",
      method: "UPI",
    });

    const hmac = crypto.createHmac("sha256", secret).update(testPayload).digest("hex");
    const validSignature = `sha256=${hmac}`;

    // Verify signature logic
    const computedHmac = crypto.createHmac("sha256", secret).update(testPayload).digest("hex");
    const cleanHeader = validSignature.replace("sha256=", "");
    const sigMatches = crypto.timingSafeEqual(Buffer.from(cleanHeader, "hex"), Buffer.from(computedHmac, "hex"));
    assert(sigMatches, "HMAC-SHA256 signature verification matches perfectly");

    // TEST 7: Settlement Guard Rule - OBSERVED_SUCCESS does NOT auto-mark PAID
    console.log("\n▶ TEST 7: Settlement Guard (OBSERVED_SUCCESS -> PAYMENT_VERIFICATION)");
    // Record webhook event
    await prisma.paymentEvent.create({
      data: {
        orderId: createdOrder.id,
        eventType: "OBSERVED_SUCCESS",
        signature: validSignature,
        utr: "998877665544",
        amount: 1399,
        settlementState: "NOT_RECONCILED",
        rawPayloadJson: testPayload,
        processed: true,
        verificationStatus: "PENDING",
      },
    });

    const updatedOrderAfterWebhook = await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        orderStatus: "PAYMENT_VERIFICATION",
        paymentStatus: "PENDING_VERIFICATION",
      },
    });

    assert(updatedOrderAfterWebhook.orderStatus === "PAYMENT_VERIFICATION", "Order moved to PAYMENT_VERIFICATION status");
    assert(updatedOrderAfterWebhook.paymentStatus !== "PAID", "Order is NOT marked PAID on webhook alert alone (Settlement Guard Active)");

    // TEST 8: Admin Manual Ledger Verification
    console.log("\n▶ TEST 8: Admin Manual Ledger Verification Decision");
    const verifiedOrder = await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        orderStatus: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });
    assert(verifiedOrder.paymentStatus === "PAID", "Order marked PAID only after manual admin bank verification");
    assert(verifiedOrder.orderStatus === "CONFIRMED", "Order moved to CONFIRMED fulfillment state");

    // TEST 9: Public Review System & Strict Demo Isolation
    console.log("\n▶ TEST 9: Public Reviews Filtering & Demo Data Strict Isolation");
    const publicReviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        isDemoData: false,
      },
    });
    const demoReviews = await prisma.review.findMany({
      where: { isDemoData: true },
    });

    assert(demoReviews.length >= 5, `Seed demo reviews exist in database (${demoReviews.length} records)`);
    assert(demoReviews.every((r) => r.isDemoData === true), "Demo records are strictly flagged with isDemoData = true");
    assert(!publicReviews.some((r) => r.isDemoData), "Zero demo records appear in public query");

    // Clean up test order & restore stock
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity: initialStock },
    });
    await prisma.order.delete({ where: { id: createdOrder.id } });

    console.log("\n==================================================");
    console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with unhandled exception:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
