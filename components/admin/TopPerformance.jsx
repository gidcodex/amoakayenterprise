import Image from "next/image";

export default function TopPerformance({ dashboardData, currency }) {
  const topStores = dashboardData.topStores || [];
  const topProducts = dashboardData.topProducts || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Top Performing Stores
        </h2>

        <div className="space-y-4">
          {topStores.length > 0 ? (
            topStores.map((store, index) => (
              <div
                key={store.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    #{index + 1} {store.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {store.orders} order(s)
                  </p>
                </div>

                <p className="font-bold text-green-600">
                  {currency}
                  {store.revenue.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No store data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Top Selling Products
        </h2>

        <div className="space-y-4">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    ) : null}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900 line-clamp-1">
                      #{index + 1} {product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {product.quantity} sold
                    </p>
                  </div>
                </div>

                <p className="font-bold text-green-600 whitespace-nowrap">
                  {currency}
                  {product.revenue.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No product data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}