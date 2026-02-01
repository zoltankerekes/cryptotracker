"use client";

import { useState, useEffect, useRef } from "react";
import { CoinPrice } from "../types/coin";
import { fetchCoinHistory, HistoricalPrice } from "../lib/coingecko";

interface CoinChartProps {
  coin: CoinPrice | null;
}

type TimeRange = 1 | 7 | 30 | 90;

interface CacheEntry {
  data: HistoricalPrice[];
  timestamp: number;
}

const CACHE_DURATION = 60000; // 1 minute

export function CoinChart({ coin }: CoinChartProps) {
  const [history, setHistory] = useState<HistoricalPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<TimeRange>(7);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const cache = useRef<Record<string, CacheEntry>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!coin) {
      setHistory([]);
      return;
    }

    const cacheKey = `${coin.id}-${days}`;
    const cached = cache.current[cacheKey];
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setHistory(cached.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchCoinHistory(coin.id, days)
      .then((data) => {
        cache.current[cacheKey] = { data, timestamp: now };
        setHistory(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [coin, days]);

  if (!coin) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        Select a coin from your watchlist to view its chart
      </div>
    );
  }

  const renderChart = () => {
    if (history.length === 0) return null;

    const prices = history.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const width = 800;
    const height = 400;
    const paddingLeft = 100;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = history.map((h, i) => {
      const x = paddingLeft + (i / (history.length - 1)) * chartWidth;
      const y =
        paddingTop + chartHeight - ((h.price - minPrice) / priceRange) * chartHeight;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const strokeColor = isPositive ? "#22c55e" : "#ef4444";

    const areaPath = `${pathD} L ${paddingLeft + chartWidth},${paddingTop + chartHeight} L ${paddingLeft},${paddingTop + chartHeight} Z`;

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
      }).format(price);
    };

    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const svgWidth = rect.width;
      const relativeX = (x / svgWidth) * width;

      if (relativeX < paddingLeft || relativeX > paddingLeft + chartWidth) {
        setHoverIndex(null);
        return;
      }

      const ratio = (relativeX - paddingLeft) / chartWidth;
      const index = Math.round(ratio * (history.length - 1));
      setHoverIndex(Math.max(0, Math.min(history.length - 1, index)));
    };

    const handleMouseLeave = () => {
      setHoverIndex(null);
    };

    const hoverData = hoverIndex !== null ? history[hoverIndex] : null;
    const hoverX = hoverIndex !== null
      ? paddingLeft + (hoverIndex / (history.length - 1)) * chartWidth
      : null;
    const hoverY = hoverData
      ? paddingTop + chartHeight - ((hoverData.price - minPrice) / priceRange) * chartHeight
      : null;

    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      if (days === 1) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-zinc-100">{coin.name}</h2>
              <span className="text-zinc-500 uppercase">{coin.symbol}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-100">
                {formatPrice(lastPrice)}
              </span>
              <span
                className={`text-lg ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {isPositive ? "+" : ""}
                {formatPrice(priceChange)} ({isPositive ? "+" : ""}
                {priceChangePercent}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {([1, 7, 30, 90] as TimeRange[]).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  days === d
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full cursor-crosshair"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={paddingLeft}
              y1={paddingTop + chartHeight * ratio}
              x2={paddingLeft + chartWidth}
              y2={paddingTop + chartHeight * ratio}
              stroke="#27272a"
              strokeWidth="1"
            />
          ))}
          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" />
          {/* Y-axis labels */}
          <text
            x={paddingLeft - 10}
            y={paddingTop + 5}
            textAnchor="end"
            className="fill-zinc-500"
            fontSize="12"
          >
            {formatPrice(maxPrice)}
          </text>
          <text
            x={paddingLeft - 10}
            y={paddingTop + chartHeight + 5}
            textAnchor="end"
            className="fill-zinc-500"
            fontSize="12"
          >
            {formatPrice(minPrice)}
          </text>
          {/* Hover elements */}
          {hoverX !== null && hoverY !== null && hoverData && (
            <>
              {/* Vertical line */}
              <line
                x1={hoverX}
                y1={paddingTop}
                x2={hoverX}
                y2={paddingTop + chartHeight}
                stroke="#71717a"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              {/* Circle on the line */}
              <circle
                cx={hoverX}
                cy={hoverY}
                r="6"
                fill={strokeColor}
                stroke="#18181b"
                strokeWidth="2"
              />
              {/* Price tooltip */}
              <g transform={`translate(${hoverX}, ${paddingTop - 10})`}>
                <rect
                  x="-50"
                  y="-28"
                  width="100"
                  height="24"
                  rx="4"
                  fill="#27272a"
                />
                <text
                  x="0"
                  y="-12"
                  textAnchor="middle"
                  fill="#fafafa"
                  fontSize="12"
                  fontWeight="600"
                >
                  {formatPrice(hoverData.price)}
                </text>
              </g>
              {/* Date label at bottom */}
              <text
                x={hoverX}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                fill="#71717a"
                fontSize="11"
              >
                {formatDate(hoverData.timestamp)}
              </text>
            </>
          )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {isLoading && (
        <div className="h-full flex items-center justify-center text-zinc-500">
          Loading chart...
        </div>
      )}
      {error && (
        <div className="h-full flex items-center justify-center text-red-500">
          {error}
        </div>
      )}
      {!isLoading && !error && renderChart()}
    </div>
  );
}
