'use client'

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export default function StoreManageProducts() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [stockModal, setStockModal] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [lowStockValue, setLowStockValue] = useState(5);

  const getStockStatus = (product) => {
    if (!product.inStock || product.stock <= 0) {
      return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
    }

    if (product.stock <= product.lowStockAt) {
      return { label: "Low Stock", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "In Stock", className: "bg-green-100 text-green-700" };
  };

  const fetchProducts = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/product", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(data.products);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (productId) => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/store/stock-toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, inStock: !product.inStock }
            : product
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = await getToken();

      const { data } = await axios.delete(`/api/store/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data.message);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const openStockModal = (product) => {
    setStockModal(product);
    setStockValue(product.stock ?? 0);
    setLowStockValue(product.lowStockAt ?? 5);
  };

  const updateStock = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/store/update-stock",
        {
          productId: stockModal.id,
          stock: Number(stockValue),
          lowStockAt: Number(lowStockValue),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((prev) =>
        prev.map((product) =>
          product.id === stockModal.id ? data.product : product
        )
      );

      toast.success(data.message);
      setStockModal(null);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl">
          Manage <span className="text-slate-800 font-medium">Products</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor product prices, variants, visibility, and inventory status.
        </p>
      </div>

      <div className="hidden xl:block bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-7xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">MRP</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Variants</th>
                <th className="px-5 py-4 font-semibold">Stock</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Inventory</th>
                <th className="px-5 py-4 font-semibold text-center">Visible</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.length > 0 ? (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex gap-3 items-center">
                          <Image
                            width={45}
                            height={45}
                            className="w-12 h-12 object-contain bg-slate-50 border border-slate-100 rounded-lg p-1"
                             src={
                                  product.variants?.find((v) => v.images?.length > 0)?.images?.[0] ||
                                  product.variants?.find((v) => v.image)?.image ||
                                  product.images?.[0]
                                  }
                            alt={product.name}
                          />

                          <div>
                            <p className="font-semibold text-slate-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p>{product.categoryRef?.name || product.category}</p>
                        {product.subcategoryRef?.name && (
                          <p className="text-xs text-slate-400">
                            {product.subcategoryRef.name}
                          </p>
                        )}
                        {product.childCategory?.name && (
                          <p className="text-xs text-blue-500">
                            {product.childCategory.name}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {currency}{product.mrp.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-bold text-green-600">
                        {currency}{product.price.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {product.variants?.length || 0} variants
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {product.stock ?? 0}
                          </p>
                          <p className="text-xs text-slate-400">
                            Alert at {product.lowStockAt ?? 5}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                         className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => openStockModal(product)}
                          className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          Update Stock
                        </button>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            onChange={() =>
                              toast.promise(toggleStock(product.id), {
                                loading: "Updating product...",
                              })
                            }
                            checked={product.inStock}
                          />

                          <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                          <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                        </label>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/store/edit-product/${product.id}`}
                            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="xl:hidden space-y-4">
  {products.length > 0 ? (
    products.map((product) => {
      const stockStatus = getStockStatus(product);

      const firstVariantImage =
        product.variants?.find((v) => v.images?.length > 0)?.images?.[0] ||
        product.variants?.find((v) => v.image)?.image ||
        product.images?.[0];

      return (
        <div
          key={product.id}
          className="bg-white border border-slate-100 rounded-2xl shadow-md p-4"
        >
          <div className="flex gap-3">
            <Image
              width={80}
              height={80}
              src={firstVariantImage}
              alt={product.name}
              className="w-20 h-20 object-contain bg-slate-50 border border-slate-100 rounded-xl p-2"
            />

            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 line-clamp-2">
                {product.name}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {product.categoryRef?.name || product.category}
              </p>

              <p className="text-green-600 font-bold mt-2">
                {currency}{product.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-500">Variants</p>
              <p className="font-bold text-blue-700">
                {product.variants?.length || 0} variants
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">Stock</p>
              <p className="font-bold text-slate-900">
                {product.stock ?? 0}
              </p>
              <p className="text-xs text-slate-400">
                Alert at {product.lowStockAt ?? 5}
              </p>
            </div>

            <div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${stockStatus.className}`}
              >
                {stockStatus.label}
              </span>
            </div>
          </div>

          {product.variants?.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.variants.flatMap((variant) => {
                const images =
                  variant.images?.length > 0
                    ? variant.images
                    : variant.image
                    ? [variant.image]
                    : [];

                return images.slice(0, 3).map((image, index) => (
                  <div
                    key={`${variant.id}-${index}`}
                    className="w-12 h-12 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={variant.value}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                ));
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => openStockModal(product)}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Update Stock
            </button>

            <div className="flex gap-2">
              <Link
                href={`/store/edit-product/${product.id}`}
                className="p-2 rounded-lg bg-blue-100 text-blue-700"
              >
                <Pencil size={16} />
              </Link>

              <button
                onClick={() => deleteProduct(product.id)}
                className="p-2 rounded-lg bg-red-100 text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="bg-white rounded-xl p-8 text-center text-slate-400">
      No products found.
    </div>
  )}
</div>

      {stockModal && (
        <div
          onClick={() => setStockModal(null)}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-slate-900">Update Stock</h2>

            <p className="text-sm text-slate-500 mt-1">{stockModal.name}</p>

            <label className="flex flex-col gap-2 mt-6 text-sm text-slate-600">
              Stock Quantity
              <input
                type="number"
                min="0"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              />
            </label>

            <label className="flex flex-col gap-2 mt-4 text-sm text-slate-600">
              Low Stock Alert Level
              <input
                type="number"
                min="1"
                value={lowStockValue}
                onChange={(e) => setLowStockValue(e.target.value)}
                className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              />
            </label>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setStockModal(null)}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  toast.promise(updateStock(), {
                    loading: "Updating stock...",
                  })
                }
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Save Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}