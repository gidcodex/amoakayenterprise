"use client";

import {
  Battery,
  Bluetooth,
  Box,
  Camera,
  Cpu,
  Database,
  HardDrive,
  Monitor,
  Network,
  Settings,
  ShieldCheck,
  Smartphone,
  Tag,
  Wifi,
} from "lucide-react";

const specificationConfig = {
  brand: {
    label: "Brand",
    icon: Tag,
  },
  model: {
    label: "Model",
    icon: Smartphone,
  },
  display: {
    label: "Display",
    icon: Monitor,
  },
  ram: {
    label: "RAM",
    icon: Database,
  },
  storage: {
    label: "Storage",
    icon: HardDrive,
  },
  processor: {
    label: "Processor",
    icon: Cpu,
  },
  camera: {
    label: "Camera",
    icon: Camera,
  },
  battery: {
    label: "Battery",
    icon: Battery,
  },
  os: {
    label: "Operating System",
    icon: Settings,
  },
  connectivity: {
    label: "Connectivity",
    icon: Wifi,
  },
  network: {
    label: "Network",
    icon: Network,
  },
  bluetooth: {
    label: "Bluetooth",
    icon: Bluetooth,
  },
  warranty: {
    label: "Warranty",
    icon: ShieldCheck,
  },
};

const formatLabel = (key) => {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, itemValue]) => itemValue !== null && itemValue !== undefined && itemValue !== "")
      .map(([key, itemValue]) => `${formatLabel(key)}: ${String(itemValue)}`)
      .join(", ");
  }

  return String(value);
};

export default function ProductSpecs({ product }) {
  const rawSpecifications =
    product?.specifications &&
    typeof product.specifications === "object" &&
    !Array.isArray(product.specifications)
      ? product.specifications
      : {};

  const specifications = Object.entries(rawSpecifications)
    .map(([key, value]) => {
      const formattedValue = formatValue(value);

      if (!formattedValue) {
        return null;
      }

      const config = specificationConfig[key.toLowerCase()] || {};

      return {
        key,
        label: config.label || formatLabel(key),
        value: formattedValue,
        icon: config.icon || Box,
      };
    })
    .filter(Boolean);

  if (specifications.length === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Settings size={21} />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-950">
                Technical Specifications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Product features and technical details.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <Settings size={32} className="mx-auto text-slate-300" />

            <p className="mt-3 font-bold text-slate-700">
              Specifications not provided
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              The seller has not yet added technical specifications for this product.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-violet-50 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Settings size={21} />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              Technical Specifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Detailed product features supplied by the seller.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {specifications.slice(0, 6).map((specification) => {
            const Icon = specification.icon;

            return (
              <div key={specification.key} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition hover:border-violet-200 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {specification.label}
                    </p>

                    <p className="mt-1 break-words text-sm font-black leading-6 text-slate-900">
                      {specification.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-black text-slate-900">
              Complete specification table
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {specifications.map((specification) => {
              const Icon = specification.icon;

              return (
                <div key={specification.key} className="grid gap-2 px-4 py-4 sm:grid-cols-[210px_1fr] sm:items-start sm:gap-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Icon size={16} className="shrink-0 text-violet-500" />
                    <span>{specification.label}</span>
                  </div>

                  <p className="break-words text-sm font-semibold leading-6 text-slate-900">
                    {specification.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}