import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, logAdminAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settingsList, contentsList, faqsList] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.siteContent.findMany(),
      prisma.faqItem.findMany({ orderBy: { displayOrder: "asc" } }),
    ]);

    const settings: Record<string, string> = {};
    settingsList.forEach((s) => (settings[s.key] = s.value));

    const contents: Record<string, any> = {};
    contentsList.forEach((c) => {
      try {
        contents[c.sectionKey] = {
          title: c.title,
          ...JSON.parse(c.contentJson),
        };
      } catch {
        contents[c.sectionKey] = { title: c.title, text: c.contentJson };
      }
    });

    return NextResponse.json({
      settings,
      contents,
      faqs: faqsList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings, contents, faqs } = body;

    // Update settings if provided
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), group: "general" },
        });
      }
    }

    // Update contents if provided
    if (contents && typeof contents === "object") {
      for (const [sectionKey, data] of Object.entries(contents)) {
        const title = (data as any)?.title || null;
        await prisma.siteContent.upsert({
          where: { sectionKey },
          update: {
            title,
            contentJson: JSON.stringify(data),
          },
          create: {
            sectionKey,
            title,
            contentJson: JSON.stringify(data),
          },
        });
      }
    }

    // Update FAQs if provided
    if (Array.isArray(faqs)) {
      await prisma.faqItem.deleteMany({});
      if (faqs.length > 0) {
        await prisma.faqItem.createMany({
          data: faqs.map((f: any, idx: number) => ({
            question: f.question,
            answer: f.answer,
            displayOrder: idx + 1,
            isActive: f.isActive !== undefined ? f.isActive : true,
          })),
        });
      }
    }

    await logAdminAudit(admin.email, "CONTENT_UPDATE", "SiteContent", undefined, {
      updatedSettings: settings ? Object.keys(settings) : [],
    });

    return NextResponse.json({ success: true, message: "Website content saved successfully" });
  } catch (err: any) {
    console.error("Content update error:", err);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
