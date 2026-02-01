"use client";

import { useState } from "react";
import { Watchlist } from "./components/Watchlist";
import { CoinChart } from "./components/CoinChart";
import { CoinPrice } from "./types/coin";

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState<CoinPrice | null>(null);

  return (
    <div className="h-screen bg-zinc-950 flex">
      {/* Chart Area - Left 80% */}
      <main className="flex-1 p-6">
        <CoinChart coin={selectedCoin} />
      </main>

      {/* Watchlist Sidebar - Right 20% */}
      <aside className="w-72 border-l border-zinc-800 p-4 bg-zinc-900/50">
        <Watchlist selectedCoin={selectedCoin} onSelectCoin={setSelectedCoin} />
      </aside>
    </div>
  );
}
