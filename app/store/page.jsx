'use client'

import Loading from "@/components/Loading";
import OrdersAreaChart from "@/components/OrdersAreaChart";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import {
  CircleDollarSign,
  ShoppingBasket,
  Star,
  Tags,
  Truck,
  PackageCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { getToken } = useAuth();
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  
const [dashboardData, setDashboardData] = useState({
  totalProducts: 0,
  totalOrders: 0,
  totalEarnings: 0,

  pendingOrders: 0,
  deliveredOrders: 0,

  healthyProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  totalInventory: 0,

  stockValue: 0,
  fastMovingProducts: [],
  slowMovingProducts: [],

  ratings: [],
  recentOrders: [],
  topProducts: [],
  allOrders: [],
  sellerActivities: [],
});

  const cards = [
    {
      title: "Total Earnings",
      value: currency + dashboardData.totalEarnings,
      icon: CircleDollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders,
      icon: Tags,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Products",
      value: dashboardData.totalProducts,
      icon: ShoppingBasket,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Ratings",
      value: dashboardData.ratings.length,
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Pending Orders",
      value: dashboardData.pendingOrders,
      icon: Truck,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Delivered Orders",
      value: dashboardData.deliveredOrders,
      icon: PackageCheck,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/store/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDashboardData(data.dashboardData);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-16">
      <h1 className="text-2xl">
        Seller <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{card.title}</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center ${card.color}`}
              >
                <card.icon size={30} />
              </div>
            </div>
          </div>
        ))}
      </div>
     
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">
      Total Inventory
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {dashboardData.totalInventory}
    </h2>
  </div>

  <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
    <p className="text-sm text-green-700">
      Healthy Products
    </p>

    <h2 className="text-3xl font-bold text-green-700 mt-2">
      {dashboardData.healthyProducts}
    </h2>
  </div>

  <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-5">
    <p className="text-sm text-yellow-700">
      Low Stock
    </p>

    <h2 className="text-3xl font-bold text-yellow-700 mt-2">
      {dashboardData.lowStockProducts}
    </h2>
  </div>

  <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
    <p className="text-sm text-red-700">
      Out of Stock
    </p>

    <h2 className="text-3xl font-bold text-red-700 mt-2">
      {dashboardData.outOfStockProducts}
    </h2>
  </div>

</div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Store Orders & Revenue
        </h2>

        <OrdersAreaChart allOrders={dashboardData.allOrders} />

      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">

  {/* Stock Value */}

  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

    <p className="text-sm text-slate-500">
      Total Inventory Value
    </p>

    <h2 className="text-3xl font-bold mt-3 text-green-600">
      {currency}
      {Number(dashboardData.stockValue).toLocaleString()}
    </h2>

    <p className="text-sm text-slate-400 mt-3">
      Current value of all inventory in stock.
    </p>

  </div>

  {/* Fast Movers */}

  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

    <h2 className="font-semibold mb-5">
      🔥 Fast Moving Products
    </h2>

    <div className="space-y-3">

      {dashboardData.fastMovingProducts.length > 0 ? (

        dashboardData.fastMovingProducts.map(product => (

          <div
            key={product.id}
            className="flex justify-between"
          >

            <span className="truncate">
              {product.name}
            </span>

            <span className="font-bold text-green-600">
              {product.quantity}
            </span>

          </div>

        ))

      ) : (

        <p className="text-slate-400">
          No sales yet.
        </p>

      )}

    </div>

  </div>

  {/* Slow Movers */}

  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

    <h2 className="font-semibold mb-5">
      🐢 Slow Moving Products
    </h2>

    <div className="space-y-3">

      {dashboardData.slowMovingProducts.length > 0 ? (

        dashboardData.slowMovingProducts.map(product => (

          <div
            key={product.id}
            className="flex justify-between"
          >

            <span className="truncate">
              {product.name}
            </span>

            <span className="text-slate-400">
              No Sales
            </span>

          </div>

        ))

      ) : (

        <p className="text-slate-400">
          Every product has sold.
        </p>

      )}

    </div>

  </div>

</div>

      <div className="grid xl:grid-cols-3 gap-6 mt-8">
        
       <SellerRecentOrders orders={dashboardData.recentOrders} currency={currency} />
       <SellerActivityFeed activities={dashboardData.sellerActivities} />
       <SellerTopProducts 
       products={dashboardData.topProducts}
       currency={currency}
      />

      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Recent Reviews
        </h2>

        <div className="space-y-5">
          {dashboardData.ratings.length > 0 ? (
            dashboardData.ratings.map((review, index) => (
              <div
                key={index}
                className="flex max-sm:flex-col gap-5 sm:items-center justify-between bg-slate-50 border border-slate-100 rounded-3xl p-5 text-sm text-slate-600"
              >
                <div>
                  <div className="flex gap-3">
                    <Image
                      src={review.user.image}
                      alt=""
                      className="w-10 h-10 rounded-full"
                      width={100}
                      height={100}
                    />

                    <div>
                      <p className="font-medium text-slate-900">
                        {review.user.name}
                      </p>
                      <p className="font-light text-slate-500">
                        {new Date(review.createdAt).toDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-slate-500 max-w-md leading-6">
                    {review.review}
                  </p>
                </div>

                <div className="flex flex-col justify-between gap-6 sm:items-end">
                  <div className="flex flex-col sm:items-end">
                    <p className="text-slate-400">{review.product?.category}</p>
                    <p className="font-medium text-slate-800">
                      {review.product?.name}
                    </p>

                    <div className="flex items-center">
                      {Array(5)
                        .fill("")
                        .map((_, index) => (
                          <Star
                            key={index}
                            size={17}
                            className="text-transparent mt-0.5"
                            fill={
                              review.rating >= index + 1 ? "#00C950" : "#D1D5DB"
                            }
                          />
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/product/${review.product.id}`)}
                    className="bg-white border border-slate-200 px-5 py-2 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SellerRecentOrders({ orders = [], currency }) {
  const statusStyles = {
    ORDER_PLACED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-yellow-100 text-yellow-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-5">Recent Orders</h2>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href="/store/orders"
              className="block bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {order.trackingNumber || order.id}
                  </p>

                  <p className="text-sm text-slate-500">
                    {order.user?.name} • {new Date(order.createdAt).toDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {currency}
                    {order.total}
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[order.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {order.status?.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400">No recent orders.</p>
        )}
      </div>
    </div>
  );
}

function SellerTopProducts({ products = [], currency }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-5">
        Top Selling Products
      </h2>

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  )}
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
          <p className="text-sm text-slate-400">No product sales yet.</p>
        )}
      </div>
    </div>
  );
}

function SellerActivityFeed({ activities = [] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>

        <Link
          href="/store/notifications"
          className="text-sm font-semibold text-green-600 hover:text-green-700"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Link
              key={activity.id}
              href={activity.link || "#"}
              className="block bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl p-4 transition"
            >
              <p className="font-semibold text-slate-900">
                {activity.title}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {activity.message}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                {new Date(activity.date).toLocaleString()}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400">No activity yet.</p>
        )}
      </div>
    </div>
  );
}