import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

const policyTitles: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms and Conditions",
  shipping: "Shipping & Delivery Policy",
  refund: "Cancellation & Refund Policy",
  warranty: "Warranty & Repair Service Policy",
};

export default async function PolicyPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const sectionKey = `policy_${slug}`;

  const content = await prisma.siteContent.findUnique({
    where: { sectionKey },
  });

  const settingsList = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  settingsList.forEach((s) => (settings[s.key] = s.value));

  let parsedBody = "";
  if (content) {
    try {
      const data = JSON.parse(content.contentJson);
      parsedBody = data.body || content.contentJson;
    } catch {
      parsedBody = content.contentJson;
    }
  }

  const title = policyTitles[slug] || "Store Policy";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        storeName={settings["store_name"]}
        supportPhone={settings["support_phone"]}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Legal & Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
            {parsedBody ? (
              <p className="whitespace-pre-line">{parsedBody}</p>
            ) : (
              <p>Policy content is being updated by store administration.</p>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 mt-6">
              <p className="font-bold text-slate-800">Support Desk Queries:</p>
              <p>
                For questions regarding this policy or order assistance, write to us at{" "}
                <a
                  href={`mailto:${settings["support_email"] || "care@aquathermal.store"}`}
                  className="text-sky-600 font-semibold underline"
                >
                  {settings["support_email"] || "care@aquathermal.store"}
                </a>{" "}
                or call {settings["support_phone"] || "+91 98765 43210"}.
              </p>
            </div>
          </div>
        </div>
      </main>

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
