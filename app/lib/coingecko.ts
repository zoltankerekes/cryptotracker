import { Coin } from "../types/coin";

const BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCoinList(): Promise<Coin[]> {
  const response = await fetch(`${BASE_URL}/coins/list`);
  if (!response.ok) {
    throw new Error("Failed to fetch coin list");
  }
  return response.json();
}

export async function fetchPrices(
  coinIds: string[]
): Promise<Record<string, { usd: number }>> {
  if (coinIds.length === 0) {
    return {};
  }
  const ids = coinIds.join(",");
  const response = await fetch(
    `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch prices");
  }
  return response.json();
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

export async function fetchCoinHistory(
  coinId: string,
  days: number = 7
): Promise<HistoricalPrice[]> {
  const response = await fetch(
    `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch historical data");
  }
  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price,
  }));
}
