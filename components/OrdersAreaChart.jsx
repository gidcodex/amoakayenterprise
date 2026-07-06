'use client'

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrdersAreaChart({ allOrders }) {
  const [mode, setMode] = useState("orders");

  const groupedData = allOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        orders: 0,
        revenue: 0,
      };
    }

    acc[date].orders += 1;
    acc[date].revenue += Number(order.total || 0);

    return acc;
  }, {});

  const chartData = Object.values(groupedData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="w-full h-[340px] text-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {mode === "orders" ? "Orders Trend" : "Revenue Trend"}
          </h3>
          <p className="text-slate-500">
            {mode === "orders"
              ? "Daily order activity"
              : "Daily revenue performance"}
          </p>
        </div>

        <div className="bg-slate-100 rounded-full p-1 flex gap-1">
          <button
            onClick={() => setMode("orders")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              mode === "orders"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500"
            }`}
          >
            Orders
          </button>

          <button
            onClick={() => setMode("revenue")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              mode === "revenue"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-500"
            }`}
          >
            Revenue
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={mode === "revenue"} />
          <Tooltip />

          <Area
            type="monotone"
            dataKey={mode}
            stroke="#16a34a"
            fill="#bbf7d0"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}