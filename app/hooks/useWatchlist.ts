"use client";

import { useState, useEffect } from "react";
import { Coin } from "../types/coin";

const STORAGE_KEY = "crypto-watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Coin[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        setWatchlist([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addCoin = (coin: Coin) => {
    setWatchlist((prev) => {
      if (prev.some((c) => c.id === coin.id)) {
        return prev;
      }
      return [...prev, coin];
    });
  };

  const removeCoin = (coinId: string) => {
    setWatchlist((prev) => prev.filter((c) => c.id !== coinId));
  };

  return { watchlist, addCoin, removeCoin, isLoaded };
}
