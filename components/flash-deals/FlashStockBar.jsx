"use client";

export default function FlashStockBar({ stock = 0 }) {
  const stockNumber = Math.max(Number(stock) || 0, 0);

  let progressWidth = 20;
  let stockLabel = `${stockNumber} remaining`;

  if (stockNumber <= 0) {
    progressWidth = 100;
    stockLabel = "Sold out";
  } else if (stockNumber <= 5) {
    progressWidth = 85;
    stockLabel = `Only ${stockNumber} left`;
  } else if (stockNumber <= 15) {
    progressWidth = 65;
  } else if (stockNumber <= 30) {
    progressWidth = 45;
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">
          {stockLabel}
        </span>

        {stockNumber > 0 && stockNumber <= 5 && (
          <span className="text-[11px] font-black uppercase tracking-wide text-red-600">
            Selling fast
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-500"
          style={{
            width: `${Math.min(progressWidth, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}