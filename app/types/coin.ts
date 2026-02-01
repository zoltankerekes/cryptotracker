export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export type PriceDirection = "up" | "down" | "unchanged";

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number | null;
  direction: PriceDirection;
}
