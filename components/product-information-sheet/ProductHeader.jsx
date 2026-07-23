"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Package,
  ScanLine,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function ProductHeader({ product }) {
  if (!product) return null;

  const image =
    product.images?.[0] ||
    product.image ||
    "/placeholder-product.png";

  const category =
    product.categoryRef?.name ||
    product.category ||
    "General";

  const brand =
    product.brand ||
    product.specifications?.brand ||
    "Not specified";

  const model =
    product.model ||
    product.specifications?.model ||
    "Not specified";

  const productId = String(product.id || "");

  const productReference = productId
    ? `AMD-${productId.slice(0, 8).toUpperCase()}`
    : "AMD-PRODUCT";

 const appUrl =
  process.env.NEXT_PUBLIC_WEBSITE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "");

  const productUrl = `${appUrl}/product/${productId}`;

  const generatedDate = new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Document heading */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100 sm:text-xs">
              Amoakay Deals Marketplace
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              Product Information Sheet
            </p>

            <h1 className="mt-3 line-clamp-2 text-xl font-black leading-tight sm:text-2xl">
              {product.name}
            </h1>
          </div>

          <div className="hidden shrink-0 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:block">
            <ScanLine size={34} />
          </div>
        </div>
      </div>

      <div className="grid gap-7 p-5 lg:grid-cols-[minmax(260px,350px)_1fr] lg:p-6">
        {/* Product image and QR */}
        <div className="space-y-4">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <Image
              src={image}
              alt={product.name || "Product image"}
              width={600}
              height={600}
              className="h-full w-full object-contain p-6"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <ScanLine
                size={18}
                className="text-blue-600"
              />

              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                Scan to view product
              </p>
            </div>

            <div className="mt-4 flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4">
              {productId && productUrl ? (
                <>
                  <div className="rounded-xl bg-white p-2">
                    <QRCode
                      value={productUrl}
                      size={132}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#020617"
                      title={`QR code for ${product.name}`}
                    />
                  </div>

                  <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-500">
                    Scan with your phone camera to open the
                    official product page.
                  </p>

                  <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-700 transition hover:text-blue-800"
                  >
                    Open product page
                    <ExternalLink size={14} />
                  </a>
                </>
              ) : (
                <p className="text-center text-sm font-semibold text-slate-500">
                  Product link is unavailable.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product identity */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<Package size={18} />}
              title="Product Reference"
              value={productReference}
            />

            <InfoCard
              icon={<CalendarDays size={18} />}
              title="Generated"
              value={generatedDate}
            />

            <InfoCard
              icon={<Tag size={18} />}
              title="Brand"
              value={brand}
            />

            <InfoCard
              icon={<Package size={18} />}
              title="Model"
              value={model}
            />

            <InfoCard
              icon={<Tag size={18} />}
              title="Category"
              value={category}
            />

            <InfoCard
              icon={<ShieldCheck size={18} />}
              title="Marketplace Status"
              value="Marketplace listing"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <BadgeCheck
                size={25}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <h3 className="font-black text-emerald-950">
                  Registered Marketplace Listing
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  This product is published on Amoakay Deals
                  and connected to a registered marketplace
                  seller account.
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  Live price and availability are shown on
                  the product page.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
              Digital product address
            </p>

            <p className="mt-2 break-all text-xs font-semibold leading-5 text-slate-600">
              {productUrl || "Product address unavailable"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-[10px] font-black uppercase tracking-[0.12em] sm:text-xs">
          {title}
        </span>
      </div>

      <p className="mt-3 break-words text-sm font-black text-slate-900">
        {value || "Not specified"}
      </p>
    </div>
  );
}