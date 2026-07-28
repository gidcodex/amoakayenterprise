"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import CreateFlashDealPanel from "@/components/flash-deals/admin/CreateFlashDealPanel";

import {
  Zap,
  Plus,
  Clock3,
  CalendarClock,
  Search,
  TrendingUp,
  Flame,
  LoaderCircle,
  Pause,
  Play,
  Trash2
} from "lucide-react";

export default function FlashDealsPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [flashDeals, setFlashDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageError, setPageError] = useState("");

  const [actionDealId, setActionDealId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchFlashDeals = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await fetch("/api/admin/flash-deals", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load Flash Deals."
        );
      }

      setFlashDeals(data.flashDeals || []);
    } catch (error) {
      console.error("Flash Deals loading error:", error);

      setPageError(
        error.message || "Unable to load Flash Deals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashDeals();
  }, [fetchFlashDeals]);


  const handleToggleFlashDeal = async (deal) => {
  setActionError("");
  setActionMessage("");
  setActionDealId(deal.id);

  try {
    const response = await fetch("/api/admin/flash-deals", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flashDealId: deal.id,
        isActive: !deal.isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to update the Flash Deal."
      );
    }

    setActionMessage(
      data.message ||
        (!deal.isActive
          ? "Flash Deal resumed successfully."
          : "Flash Deal paused successfully.")
    );

    await fetchFlashDeals();

    setTimeout(() => {
      setActionMessage("");
    }, 3000);
  } catch (error) {
    console.error("Flash Deal status error:", error);

    setActionError(
      error.message || "Unable to update the Flash Deal."
    );
  } finally {
    setActionDealId(null);
  }
};

const handleDeleteFlashDeal = async (deal) => {
  const confirmed = window.confirm(
    `Delete the Flash Deal for "${deal.product?.name || "this product"}"?`
  );

  if (!confirmed) {
    return;
  }

  setActionError("");
  setActionMessage("");
  setActionDealId(deal.id);

  try {
    const response = await fetch(
      `/api/admin/flash-deals?id=${encodeURIComponent(deal.id)}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to delete the Flash Deal."
      );
    }

    setActionMessage(
      data.message || "Flash Deal deleted successfully."
    );

    await fetchFlashDeals();

    setTimeout(() => {
      setActionMessage("");
    }, 3000);
  } catch (error) {
    console.error("Delete Flash Deal error:", error);

    setActionError(
      error.message || "Unable to delete the Flash Deal."
    );
  } finally {
    setActionDealId(null);
  }
};
  const now = new Date();

  const activeDeals = flashDeals.filter((deal) => {
    const startsAt = new Date(deal.startsAt);
    const endsAt = new Date(deal.endsAt);

    return (
      deal.isActive &&
      startsAt <= now &&
      endsAt > now
    );
  });

  const scheduledDeals = flashDeals.filter((deal) => {
    return (
      deal.isActive &&
      new Date(deal.startsAt) > now
    );
  });

  const expiredDeals = flashDeals.filter((deal) => {
    return new Date(deal.endsAt) <= now;
  });

  const stats = [
    {
      title: "Active Deals",
      value: activeDeals.length,
      icon: Zap,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      title: "Scheduled",
      value: scheduledDeals.length,
      icon: CalendarClock,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Expired",
      value: expiredDeals.length,
      icon: Clock3,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      title: "Products on Promotion",
      value: flashDeals.length,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const filteredDeals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return flashDeals;
    }

    return flashDeals.filter((deal) => {
      const productName =
        deal.product?.name?.toLowerCase() || "";

      const storeName =
        deal.product?.store?.name?.toLowerCase() || "";

      const categoryName =
        (
          deal.product?.categoryRef?.name ||
          deal.product?.category ||
          ""
        ).toLowerCase();

      return (
        productName.includes(query) ||
        storeName.includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [flashDeals, searchTerm]);

  const getStatus = (deal) => {
    const startsAt = new Date(deal.startsAt);
    const endsAt = new Date(deal.endsAt);

    if (!deal.isActive) {
      return {
        label: "Inactive",
        className: "bg-slate-100 text-slate-600",
      };
    }

    if (startsAt > now) {
      return {
        label: "Scheduled",
        className: "bg-blue-50 text-blue-700",
      };
    }

    if (endsAt <= now) {
      return {
        label: "Expired",
        className: "bg-slate-100 text-slate-600",
      };
    }

    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700",
    };
  };

  const formatDate = (dateValue) => {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateValue));
  };

  const getProductImage = (product) => {
    return (
      product?.variants?.[0]?.images?.[0] ||
      product?.variants?.[0]?.image ||
      product?.images?.[0] ||
      "/placeholder.png"
    );
  };

  return (
    <>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <Flame size={16} />
              Flash Deals
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Flash Deals Manager
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Create limited-time offers, schedule promotional
              campaigns and manage products displayed in the
              Flash Deals section.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
          >
            <Plus size={18} />
            Create Flash Deal
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-slate-900">
                      {item.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center ${item.bg}`}
                  >
                    <Icon className={item.color} size={26} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-10 border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 border border-slate-200 px-4 py-3">
            <Search size={20} className="text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="flex-1 bg-transparent outline-none"
              placeholder="Search flash deals..."
            />
          </div>
        </div>

        {/* Deals list */}
   {actionError && (
  <div className="mt-8 border-l-4 border-red-500 bg-red-50 px-5 py-4">
    <p className="font-semibold text-red-700">
      {actionError}
    </p>
  </div>
)}

{actionMessage && (
  <div className="mt-8 border-l-4 border-emerald-500 bg-emerald-50 px-5 py-4">
    <p className="font-semibold text-emerald-700">
      {actionMessage}
    </p>
  </div>
)}

        <div className="mt-8 overflow-hidden border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Flash Deals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredDeals.length} deal
                {filteredDeals.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={fetchFlashDeals}
              disabled={loading}
              className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
              <LoaderCircle
                size={22}
                className="animate-spin"
              />
              Loading Flash Deals...
            </div>
          ) : pageError ? (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-red-600">
                {pageError}
              </p>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="py-20 text-center">
              <Zap
                size={60}
                className="mx-auto text-red-300"
              />

              <h3 className="mt-5 text-xl font-semibold text-slate-700">
                No Flash Deals Found
              </h3>

              <p className="mt-2 text-slate-500">
                Created Flash Deals will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredDeals.map((deal) => {
                const status = getStatus(deal);
                const product = deal.product;

                return (
                  <article
                     key={deal.id}
                     className="grid gap-5 px-5 py-6 transition hover:bg-slate-50 lg:grid-cols-[minmax(260px,1.6fr)_110px_90px_130px_170px_150px] lg:items-center"
                  >

                    {/* Product */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 border border-slate-200 bg-slate-50">
                        <Image
                          src={getProductImage(product)}
                          alt={product?.name || "Flash Deal product"}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-bold text-slate-900">
                          {product?.name || "Unknown product"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {product?.store?.name || "Unknown store"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {product?.categoryRef?.name ||
                            product?.category ||
                            "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    {/* Prices */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Deal price
                      </p>

                      <p className="mt-1 font-black text-red-600">
                        €{Number(deal.dealPrice).toFixed(2)}
                      </p>

                      <p className="text-sm text-slate-400 line-through">
                        €{Number(deal.originalPrice).toFixed(2)}
                      </p>
                    </div>

                    {/* Discount */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Discount
                      </p>

                      <p className="mt-1 text-lg font-black text-emerald-600">
                        {deal.discountPercent}%
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <span
                        className={`mt-2 inline-flex px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>

                      {deal.isFeatured && (
                        <p className="mt-2 text-xs font-semibold text-amber-600">
                          Featured on homepage
                        </p>
                      )}
                    </div>

                    {/* Schedule */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Schedule
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Starts: {formatDate(deal.startsAt)}
                      </p>

                      <p className="text-xs leading-5 text-slate-600">
                        Ends: {formatDate(deal.endsAt)}
                      </p>
                    </div>

                          {/* Actions */}
<div>
  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
    Actions
  </p>

  <div className="mt-2 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => handleToggleFlashDeal(deal)}
      disabled={actionDealId === deal.id}
      className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        deal.isActive
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {actionDealId === deal.id ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : deal.isActive ? (
        <Pause size={15} />
      ) : (
        <Play size={15} />
      )}

      {deal.isActive ? "Pause" : "Resume"}
    </button>

    <button
      type="button"
      onClick={() => handleDeleteFlashDeal(deal)}
      disabled={actionDealId === deal.id}
      className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {actionDealId === deal.id ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : (
        <Trash2 size={15} />
      )}

      Delete
    </button>
  </div>
</div>

                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateFlashDealPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={fetchFlashDeals}
      />
    </>
  );
}