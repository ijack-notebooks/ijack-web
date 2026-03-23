"use client";

import Link from "next/link";

const OFFER_ITEMS = [
  {
    label: "Limited time",
    text: "Buy 3 notebooks, get 1 free — use code BUY3GET1 at checkout",
  },
  {
    label: "Stack up",
    text: "Buy 5 get 2 free with BUY5GET2",
  },
  {
    label: "Best value",
    text: "Buy 10 get 5 free — BUY10GET5 for serious collectors",
  },
  {
    label: "How it works",
    text: "Add enough notebooks to your cart, apply the code — free items auto-adjust",
  },
];

function CrawlSegment() {
  return (
    <>
      {OFFER_ITEMS.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-3 mx-10 whitespace-nowrap"
        >
          <span className="rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5">
            {item.label}
          </span>
          <span className="text-gray-200 text-sm sm:text-base font-medium">
            {item.text}
          </span>
          <span className="text-blue-400/80" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Full-width scrolling promo strip — matches gray-900 / blue-600 site palette.
 */
export default function OfferCrawl({ className = "" }) {
  return (
    <div
      className={`sticky top-16 z-40 shadow-md shadow-black/20 overflow-hidden border-y border-blue-600/25 bg-linear-to-r from-gray-900 via-slate-900 to-gray-900 ${className}`}
      role="region"
      aria-label="Limited period offers"
    >
      <div className="absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-linear-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-linear-to-l from-gray-900 to-transparent pointer-events-none" />

      <div className="flex items-center py-2.5 sm:py-3">
        <Link
          href="/notebooks"
          className="shrink-0 z-20 pl-3 sm:pl-5 pr-2 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
        >
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-white group-hover:text-blue-200">
            Offers
          </span>
        </Link>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex w-max animate-offer-crawl">
            <CrawlSegment />
            <CrawlSegment />
          </div>
        </div>

        <Link
          href="/cart"
          className="shrink-0 z-20 pr-3 sm:pr-5 pl-2 text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap transition-colors"
        >
          Shop →
        </Link>
      </div>
    </div>
  );
}
