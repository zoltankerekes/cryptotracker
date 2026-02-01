"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Coin, CoinPrice, PriceDirection } from "../types/coin";
import { fetchPrices } from "../lib/coingecko";

const REFRESH_INTERVAL = 30; // 30 seconds
const CACHE_DURATION = 30000; // 30 seconds cache

interface PriceHistory {
  price: number;
  direction: PriceDirection;
}

interface PriceCache {
  data: Record<string, { usd: number }>;
  timestamp: number;
}

export function useCoinPrices(watchlist: Coin[]) {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const priceHistory = useRef<Record<string, PriceHistory>>({});
  const priceCache = useRef<PriceCache | null>(null);

  const loadPrices = useCallback(async (forceRefresh = false) => {
    if (watchlist.length === 0) {
      setPrices([]);
      return;
    }

    const coinIds = watchlist.map((c) => c.id);
    const cacheKey = coinIds.sort().join(",");
    const now = Date.now();

    // Check cache
    if (
      !forceRefresh &&
      priceCache.current &&
      priceCache.current.timestamp > now - CACHE_DURATION
    ) {
      // Use cached data
      const priceData = priceCache.current.data;
      const updatedPrices: CoinPrice[] = watchlist.map((coin) => {
        const currentPrice = priceData[coin.id]?.usd ?? null;
        const history = priceHistory.current[coin.id];
        const direction: PriceDirection = history?.direction ?? "unchanged";

        return {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: currentPrice,
          direction,
        };
      });
      setPrices(updatedPrices);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const priceData = await fetchPrices(coinIds);

      // Update cache
      priceCache.current = {
        data: priceData,
        timestamp: now,
      };

      const updatedPrices: CoinPrice[] = watchlist.map((coin) => {
        const currentPrice = priceData[coin.id]?.usd ?? null;
        const history = priceHistory.current[coin.id];

        let direction: PriceDirection = "unchanged";

        if (currentPrice !== null && history) {
          if (currentPrice > history.price) {
            direction = "up";
          } else if (currentPrice < history.price) {
            direction = "down";
          } else {
            // Keep the previous direction if price hasn't changed
            direction = history.direction;
          }
        }

        if (currentPrice !== null) {
          priceHistory.current[coin.id] = {
            price: currentPrice,
            direction,
          };
        }

        return {
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          price: currentPrice,
          direction,
        };
      });

      setPrices(updatedPrices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    loadPrices();
    setCountdown(REFRESH_INTERVAL);
  }, [loadPrices]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadPrices(true); // Force refresh when countdown reaches 0
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loadPrices]);

  return { prices, isLoading, error, countdown, refresh: loadPrices };
}
