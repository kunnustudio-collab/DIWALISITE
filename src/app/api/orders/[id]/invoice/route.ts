import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const admin = await getAdminFromRequest(req);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (!admin && (!token || token !== order.accessToken)) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    const address = JSON.parse(order.shippingAddressJson);
    const settingsList = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    settingsList.forEach((s) => (settings[s.key] = s.value));

    const storeName = settings["store_name"] || "AquaThermal Essentials";
    const storeEmail = settings["support_email"] || "care@aquathermal.store";
    const storePhone = settings["support_phone"] || "+91 98765 43210";
    const storeAddress = settings["business_address"] || "Electronics Zone, Phase IV, Gurgaon, Haryana, India";

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Tax Invoice - ${order.orderNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 30px; background: #f8fafc; }
          .invoice-box { max-width: 800px; margin: auto; padding: 36px; border: 1px solid #e2e8f0; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
          .brand h1 { margin: 0; font-size: 24px; color: #0284c7; font-weight: 800; }
          .brand p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
          .inv-title { text-align: right; }
          .inv-title h2 { margin: 0; font-size: 20px; color: #0f172a; text-transform: uppercase; }
          .inv-title p { margin: 4px 0 0; font-size: 13px; color: #475569; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; font-size: 14px; }
          .details h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
          .details p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .totals { width: 320px; margin-left: auto; margin-top: 10px; font-size: 14px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals-row.grand { border-top: 2px solid #0f172a; font-weight: bold; font-size: 16px; margin-top: 6px; padding-top: 10px; color: #0284c7; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
          .print-btn { display: inline-block; background: #0284c7; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 20px; border: none; cursor: pointer; }
          @media print {
            body { padding: 0; background: #fff; }
            .invoice-box { border: none; box-shadow: none; padding: 0; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: auto; text-align: right;">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>
        <div class="invoice-box">
          <div class="header">
            <div class="brand">
              <h1>${storeName}</h1>
              <p>${storeAddress}</p>
              <p>Email: ${storeEmail} | Phone: ${storePhone}</p>
            </div>
            <div class="inv-title">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice #:</strong> INV-${order.orderNumber.replace("ORD-", "")}</p>
              <p><strong>Order #:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>Status:</strong> ${order.paymentStatus}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <h3>Billed & Shipped To</h3>
              <p><strong>${address.fullName}</strong></p>
              <p>${address.houseNumber}, ${address.street}</p>
              ${address.landmark ? `<p>Landmark: ${address.landmark}</p>` : ""}
              <p>${address.city}, ${address.state} - ${address.pincode}</p>
              <p>Phone: ${address.phone}</p>
              <p>Email: ${order.customerEmail}</p>
            </div>
            <div>
              <h3>Payment & Dispatch Information</h3>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
              <p><strong>Order Status:</strong> ${order.orderStatus}</p>
              <p><strong>Dispatch:</strong> Express Insured Courier</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">HSN Code</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    <strong>${item.productName}</strong><br/>
                    <small style="color: #64748b;">Genuine Sealed Pack with 2-Year Manufacturer Warranty</small>
                  </td>
                  <td style="text-align: center;">8516</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                  <td style="text-align: right;">${formatCurrency(item.totalAmount)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.originalAmount - order.discountAmount)}</span>
            </div>
            ${
              order.couponDiscount > 0
                ? `
              <div class="totals-row" style="color: #16a34a;">
                <span>Coupon Discount:</span>
                <span>-${formatCurrency(order.couponDiscount)}</span>
              </div>
            `
                : ""
            }
            <div class="totals-row">
              <span>Shipping & Insurance:</span>
              <span>${order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}</span>
            </div>
            <div class="totals-row grand">
              <span>Total Payable Amount:</span>
              <span>${formatCurrency(order.finalAmount)}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Authorized Retail Distributor</strong> | GST & Supply Compliant</p>
            <p>Thank you for purchasing genuine home appliances. For product service or warranty assistance, retain this invoice and contact customer support at ${storeEmail}.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(invoiceHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    return new NextResponse("Failed to generate invoice", { status: 500 });
  }
}
