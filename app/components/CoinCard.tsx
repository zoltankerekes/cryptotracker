"use client";

import { CoinPrice } from "../types/coin";

interface CoinCardProps {
  coin: CoinPrice;
  onRemove: (id: string) => void;
  onClick: () => void;
  isSelected?: boolean;
}

export function CoinCard({ coin, onRemove, onClick, isSelected }: CoinCardProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const getBgColor = () => {
    const selectedRing = isSelected ? "ring-2 ring-blue-500" : "";
    switch (coin.direction) {
      case "up":
        return "bg-green-950 border-green-500";
      case "down":
        return "bg-red-950 border-red-500";
      default:
        return `bg-zinc-900 border-zinc-800 hover:border-zinc-700 ${selectedRing}`;
    }
  };

  const Arrow = () => {
    if (coin.direction === "up") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-400"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      );
    }
    if (coin.direction === "down") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`relative group rounded-lg p-4 border transition-colors cursor-pointer ${getBgColor()}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(coin.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
        aria-label={`Remove ${coin.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
      <div className="text-sm text-zinc-400 uppercase font-medium">
        {coin.symbol}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`text-xl font-semibold ${
            coin.direction === "up"
              ? "text-green-400"
              : coin.direction === "down"
                ? "text-red-400"
                : "text-zinc-100"
          }`}
        >
          {formatPrice(coin.price)}
        </span>
        <Arrow />
      </div>
      <div className="text-xs text-zinc-500 mt-1 truncate">{coin.name}</div>
    </div>
  );
}
