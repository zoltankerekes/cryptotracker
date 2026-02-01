"use client";

interface AddCoinButtonProps {
  onClick: () => void;
}

export function AddCoinButton({ onClick }: AddCoinButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-zinc-900 rounded-lg p-3 border-2 border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
      aria-label="Add cryptocurrency"
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
        className="text-zinc-500"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span className="text-zinc-500 text-sm">Add Coin</span>
    </button>
  );
}
