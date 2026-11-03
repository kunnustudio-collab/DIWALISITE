"useContent";
import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface AnnouncementBarProps {
  text?: string;
  enabled?: boolean;
  link?: string;
}

export function AnnouncementBar({
  text = "🔥 Winter Special: Flat 32% Off on Havells Zella 1000W + Free Express Shipping India-Wide!",
  enabled = true,
  link = "#hero-buy",
}: AnnouncementBarProps) {
  if (!enabled) return null;

  return (
    <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white text-xs sm:text-sm py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
        <span>{text}</span>
        {link && (
          <a
            href={link}
            className="hidden sm:inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-amber-200 transition-colors"
          >
            Claim Offer <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
