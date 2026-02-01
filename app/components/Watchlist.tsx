"use client";

import { useState } from "react";
import { useWatchlist } from "../hooks/useWatchlist";
import { useCoinPrices } from "../hooks/useCoinPrices";
import { CoinCard } from "./CoinCard";
import { AddCoinButton } from "./AddCoinButton";
import { CoinSearchModal } from "./CoinSearchModal";
import { CoinPrice } from "../types/coin";

interface WatchlistProps {
  selectedCoin: CoinPrice | null;
  onSelectCoin: (coin: CoinPrice) => void;
}

export function Watchlist({ selectedCoin, onSelectCoin }: WatchlistProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { watchlist, addCoin, removeCoin, isLoaded } = useWatchlist();
  const { prices, isLoading, error, countdown } = useCoinPrices(watchlist);

  if (!isLoaded) {
    return (
      <div className="text-zinc-400">
        Loading watchlist...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-zinc-100 mb-1">Watchlist</h1>
        <div className="text-xs text-zinc-500">
          {isLoading ? (
            "Updating..."
          ) : (
            <span>Refresh in <span className="text-zinc-300">{countdown}s</span></span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-900/30 text-red-400 rounded text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {prices.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onRemove={removeCoin}
            onClick={() => onSelectCoin(coin)}
            isSelected={selectedCoin?.id === coin.id}
          />
        ))}
      </div>

      <div className="mt-3">
        <AddCoinButton onClick={() => setIsModalOpen(true)} />
      </div>

      {watchlist.length === 0 && (
        <p className="mt-3 text-zinc-500 text-center text-xs">
          Click + to add coins
        </p>
      )}

      <CoinSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={addCoin}
        existingIds={watchlist.map((c) => c.id)}
      />
    </div>
  );
}
