"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import UpdateInventoryModal from "@/components/store/UpdateInventoryModal";

export default function VariantInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  async function loadInventory() {
    try {
      setLoading(true);

      const res = await fetch("/api/store/variant-inventory");
      const data = await res.json();

      if (res.ok) {
        setInventory(data.inventoryItems || []);
        setSummary(data.summary || {});
      } else {
        console.error(data.error || "Failed to load inventory.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return inventory;

    return inventory.filter((item) => {
      return (
        item.productName?.toLowerCase().includes(query) ||
        item.variantName?.toLowerCase().includes(query) ||
        item.variantValue?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.barcode?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    });
  }, [inventory, search]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Variant Inventory
          </h1>

          <p className="mt-1 text-slate-500">
            Manage stock for every product variation.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card
          title="Items"
          value={summary.totalItems}
          icon={<Package className="text-blue-600" />}
        />

        <Card
          title="Units"
          value={summary.totalUnits}
          icon={<Package className="text-indigo-600" />}
        />

        <Card
          title="In Stock"
          value={summary.inStock}
          icon={<CheckCircle2 className="text-green-600" />}
        />

        <Card
          title="Low Stock"
          value={summary.lowStock}
          icon={<AlertTriangle className="text-orange-500" />}
        />

        <Card
          title="Out of Stock"
          value={summary.outOfStock}
          icon={<XCircle className="text-red-500" />}
        />
      </div>

      <div className="relative mt-8">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product, SKU, barcode or variant..."
          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100">
            <tr className="text-left text-sm text-slate-600">
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Variant</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Low Stock At</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-slate-500"
                >
                  Loading inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-slate-500"
                >
                  No inventory found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={`${item.inventoryType}-${item.id}`}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName || "Product"}
                          className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-400">
                          No image
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate font-semibold text-slate-900">
                          {item.productName}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {item.variantName
                      ? `${item.variantName}: ${item.variantValue}`
                      : "Main product"}
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {item.sku || "-"}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-900">
                      {item.stock}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {item.lowStockAt}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariant(item);
                        setOpenModal(true);
                      }}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UpdateInventoryModal
        open={openModal}
        variant={selectedVariant}
        onClose={() => {
          setOpenModal(false);
          setSelectedVariant(null);
        }}
        onSaved={loadInventory}
      />
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {value ?? 0}
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    IN_STOCK: "bg-green-100 text-green-700",
    LOW_STOCK: "bg-orange-100 text-orange-700",
    OUT_OF_STOCK: "bg-red-100 text-red-700",
    INACTIVE: "bg-slate-100 text-slate-600",
  };

  const labels = {
    IN_STOCK: "In Stock",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
    INACTIVE: "Inactive",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}