import { NextRequest, NextResponse } from "next/server";

import {
  fetchReferenceRate,
  normalizeCurrencyCode,
} from "../../../lib/exchange-rate";

export async function GET(request: NextRequest) {
  const baseCurrency = normalizeCurrencyCode(
    request.nextUrl.searchParams.get("base"),
  );
  const quoteCurrency = normalizeCurrencyCode(
    request.nextUrl.searchParams.get("quote"),
  );

  if (!baseCurrency || !quoteCurrency) {
    return NextResponse.json(
      { error: "Valid base and quote currency codes are required." },
      { status: 400 },
    );
  }

  try {
    const rate = await fetchReferenceRate(baseCurrency, quoteCurrency);
    return NextResponse.json(rate, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "A current reference rate is unavailable. Enter a rate manually to continue.",
      },
      { status: 502 },
    );
  }
}
