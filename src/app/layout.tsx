import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Havells Zella 1000W Immersion Rod (Blue) | Genuine Winter Warmth",
  description:
    "Buy authentic Havells Zella 1000W Immersion Water Heater in Blue. Features temperature setting dial, nickel-plated heating element, automatic thermal cut-off, and 2-year warranty.",
  keywords: [
    "Havells Zella immersion rod",
    "1000W water heater",
    "immersion rod blue",
    "havells immersion rod",
    "buy immersion rod online India",
  ],
  openGraph: {
    title: "Havells Zella 1000W Immersion Rod (Blue) - Instant Water Heating",
    description: "Equipped with temperature control knob, nickel-plated copper tube element, and 2-year manufacturer warranty.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
