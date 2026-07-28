export default function DealBadge({
  discountPercent,
}) {
  return (
    <div className="absolute left-0 top-0 z-20 overflow-hidden rounded-br-xl">

      <div className="bg-red-600 px-4 py-2 text-sm font-black text-white shadow-lg">
        -{discountPercent}%
      </div>

    </div>
  );
}