"use client";

import { useState, useEffect, useMemo } from "react";
import { Coin } from "../types/coin";
import { fetchCoinList } from "../lib/coingecko";

interface CoinSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (coin: Coin) => void;
  existingIds: string[];
}

export function CoinSearchModal({
  isOpen,
  onClose,
  onSelect,
  existingIds,
}: CoinSearchModalProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && coins.length === 0) {
      setIsLoading(true);
      setError(null);
      fetchCoinList()
        .then(setCoins)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, coins.length]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const filteredCoins = useMemo(() => {
    if (!search.trim()) return coins.slice(0, 50);
    const query = search.toLowerCase();
    return coins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      )
      .slice(0, 50);
  }, [coins, search]);

  const handleSelect = (coin: Coin) => {
    onSelect(coin);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            Add Cryptocurrency
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-300"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4 border-b border-zinc-800">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coins..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-zinc-500">
              Loading coins...
            </div>
          )}
          {error && (
            <div className="p-4 text-center text-red-500">{error}</div>
          )}
          {!isLoading && !error && filteredCoins.length === 0 && (
            <div className="p-4 text-center text-zinc-500">No coins found</div>
          )}
          {!isLoading &&
            !error &&
            filteredCoins.map((coin) => {
              const isAdded = existingIds.includes(coin.id);
              return (
                <button
                  key={coin.id}
                  onClick={() => !isAdded && handleSelect(coin)}
                  disabled={isAdded}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors text-left ${
                    isAdded ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-zinc-100">
                      {coin.name}
                    </div>
                    <div className="text-sm text-zinc-500 uppercase">
                      {coin.symbol}
                    </div>
                  </div>
                  {isAdded && (
                    <span className="text-xs text-zinc-400">Added</span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
