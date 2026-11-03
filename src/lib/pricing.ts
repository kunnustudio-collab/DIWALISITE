import { prisma } from "./prisma";

export interface OrderPricingCalculation {
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    originalPrice: number;
    stockQuantity: number;
    isInStock: boolean;
  };
  quantity: number;
  originalSubtotal: number;
  sellingSubtotal: number;
  productDiscountTotal: number;
  couponDiscount: number;
  shippingFee: number;
  finalPayableAmount: number;
  couponApplied?: {
    code: string;
    description?: string | null;
    discountAmount: number;
  };
  error?: string;
}

export async function calculateOrderPricing({
  productId,
  quantity,
  couponCode,
}: {
  productId?: string;
  quantity: number;
  couponCode?: string | null;
}): Promise<OrderPricingCalculation> {
  const safeQty = Math.max(1, Math.min(10, Math.floor(quantity || 1)));

  // If no productId is given, default to the featured Havells Zella immersion rod
  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId } })
    : await prisma.product.findFirst({ where: { isFeatured: true } });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isInStock || product.stockQuantity < safeQty) {
    throw new Error(`Insufficient stock. Only ${product.stockQuantity} units available.`);
  }

  const originalSubtotal = product.originalPrice * safeQty;
  const sellingSubtotal = product.sellingPrice * safeQty;
  const productDiscountTotal = originalSubtotal - sellingSubtotal;

  let couponDiscount = 0;
  let couponApplied = undefined;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    const now = new Date();

    if (coupon && coupon.isActive) {
      const isStarted = !coupon.startsAt || coupon.startsAt <= now;
      const isNotExpired = !coupon.expiresAt || coupon.expiresAt >= now;
      const withinLimit = coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit;
      const meetsMinCart = sellingSubtotal >= coupon.minCartValue;

      if (isStarted && isNotExpired && withinLimit && meetsMinCart) {
        if (coupon.discountType === "PERCENTAGE") {
          const rawDiscount = (sellingSubtotal * coupon.discountValue) / 100;
          couponDiscount = coupon.maxDiscountAmount
            ? Math.min(rawDiscount, coupon.maxDiscountAmount)
            : rawDiscount;
        } else {
          couponDiscount = Math.min(coupon.discountValue, sellingSubtotal);
        }

        couponDiscount = Math.round(couponDiscount);
        couponApplied = {
          code: coupon.code,
          description: coupon.description,
          discountAmount: couponDiscount,
        };
      }
    }
  }

  // Fetch shipping fee setting
  const shippingSetting = await prisma.siteSetting.findUnique({
    where: { key: "shipping_fee" },
  });
  const shippingFee = shippingSetting ? parseFloat(shippingSetting.value) || 0 : 0;

  const finalPayableAmount = Math.max(1, sellingSubtotal - couponDiscount + shippingFee);

  return {
    product: {
      id: product.id,
      name: product.name,
      sellingPrice: product.sellingPrice,
      originalPrice: product.originalPrice,
      stockQuantity: product.stockQuantity,
      isInStock: product.isInStock,
    },
    quantity: safeQty,
    originalSubtotal,
    sellingSubtotal,
    productDiscountTotal,
    couponDiscount,
    shippingFee,
    finalPayableAmount,
    couponApplied,
  };
}
