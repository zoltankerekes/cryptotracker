import { NextResponse } from "next/server";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function GET() {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/list`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch coin list:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin list" },
      { status: 500 }
    );
  }
}
