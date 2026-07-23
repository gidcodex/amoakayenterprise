"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { detectIntent } from "@/components/ai/engine/intentEngine";
import AssistantProductCard from "@/components/ai/AssistantProductCard";
import SellerOrderCard from "@/components/ai/SellerOrderCard";
import SellerAnalyticsCard from "@/components/ai/SellerAnalyticsCard";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  X,
  Search,
  ShoppingCart,
  PackageSearch,
  Store,
  MessageCircle,
  Heart,
  LogIn,
  UserRound,
  Send,
} from "lucide-react";

import FloatingOrb from "@/components/ai/FloatingOrb";
import LanguageSwitcher from "@/components/ai/LanguageSwitcher";
import TypingText from "@/components/ai/TypingText";
import { adetoBoafoContent } from "@/components/ai/tourContent";
import TourEngine from "@/components/ai/TourEngine";
import useAdetoBoafo from "./core/useAdetoBoafo.js";

const TOUR_COMPLETED_KEY = "amoakay-tour-completed";
const TOUR_LANGUAGE_KEY = "amoakay-tour-language";
const TOUR_SEEN_KEY = "amoakay-tour-welcome-seen";

const GUEST_QUICK_ACTIONS = [
  {
    id: "browse",
    label: "Browse Products",
    icon: Search,
    href: "/shop",
  },
  {
    id: "tracking",
    label: "Track Order",
    icon: PackageSearch,
    href: "/track-order",
  },
  {
    id: "seller",
    label: "Become a Seller",
    icon: Store,
    href: "/create-store",
  },
  {
    id: "signin",
    label: "Sign In",
    icon: LogIn,
    href: "/sign-in",
  },
  {
    id: "support",
    label: "Contact Support",
    icon: MessageCircle,
    href: "/contact",
  },
];

const CUSTOMER_QUICK_ACTIONS = [
  {
    id: "phones",
    label: "Find Phones",
    icon: Search,
    href: "/shop?search=phone",
  },
  {
    id: "cart",
    label: "My Cart",
    icon: ShoppingCart,
    href: "/cart",
  },
  {
    id: "tracking",
    label: "Track My Order",
    icon: PackageSearch,
    href: "/track-order",
  },
  {
    id: "wishlist",
    label: "Continue Shopping",
    icon: Heart,
    href: "/shop",
  },
  {
    id: "account",
    label: "Browse Products",
    icon: UserRound,
    href: "/shop",
  },
  {
    id: "support",
    label: "Contact Support",
    icon: MessageCircle,
    href: "/contact",
  },
];

const PENDING_SELLER_QUICK_ACTIONS = [
  {
    id: "seller-status",
    label: "Check Store Status",
    icon: Store,
    href: "/create-store",
  },
  {
    id: "browse",
    label: "Browse Products",
    icon: Search,
    href: "/shop",
  },
  {
    id: "tracking",
    label: "Track My Order",
    icon: PackageSearch,
    href: "/track-order",
  },
  {
    id: "support",
    label: "Contact Support",
    icon: MessageCircle,
    href: "/contact",
  },
];

const SELLER_QUICK_ACTIONS = [
  {
    id: "seller-dashboard",
    label: "Seller Dashboard",
    icon: Store,
    href: "/store",
  },
  {
    id: "manage-products",
    label: "Manage Products",
    icon: ShoppingBag,
    href: "/store/manage-product",
  },
  {
    id: "seller-orders",
    label: "View Orders",
    icon: PackageSearch,
    href: "/store/orders",
  },
  {
    id: "browse",
    label: "Browse Marketplace",
    icon: Search,
    href: "/shop",
  },
  {
    id: "support",
    label: "Contact Support",
    icon: MessageCircle,
    href: "/contact",
  },
];

const ADMIN_QUICK_ACTIONS = [
  {
    id: "admin-dashboard",
    label: "Admin Dashboard",
    icon: UserRound,
    href: "/admin",
  },
  {
    id: "admin-stores",
    label: "Manage Stores",
    icon: Store,
    href: "/admin/stores",
  },
  {
    id: "admin-messages",
    label: "View Messages",
    icon: MessageCircle,
    href: "/admin/messages",
  },
  {
    id: "browse",
    label: "Browse Marketplace",
    icon: Search,
    href: "/shop",
  },
];


const AdetoBoafo = () => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [accountContext, setAccountContext] = useState({
  authenticated: false,
  role: "guest",
  sellerStatus: null,
  active: false,
  businessVerified: false,
  storeId: null,
  storeName: null,
  username: null,
});

const [accountContextLoading, setAccountContextLoading] =
  useState(true);
 

  const [isOpen, setIsOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);
  const [mounted, setMounted] = useState(false);

const [chatInput, setChatInput] = useState("");
const [assistantReply, setAssistantReply] = useState("");
const [isAssistantThinking, setIsAssistantThinking] = useState(false);

const [assistantProducts, setAssistantProducts] = useState([]);
const [sellerProducts, setSellerProducts] = useState([]);
const [sellerOrders, setSellerOrders] = useState([]);
const [sellerAnalytics, setSellerAnalytics] = useState(null);
const [productSearchError, setProductSearchError] = useState("");

const [categoryTree, setCategoryTree] = useState([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);

const [catalogueTerms, setCatalogueTerms] =
  useState({
    brands: [],
    productNames: [],
  });

const [
  catalogueTermsLoading,
  setCatalogueTermsLoading,
] = useState(true);

useEffect(() => {
  let ignoreRequest = false;

  const loadAccountContext = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (!ignoreRequest) {
        setAccountContext({
          authenticated: false,
          role: "guest",
          sellerStatus: null,
          active: false,
          businessVerified: false,
          storeId: null,
          storeName: null,
          username: null,
        });
        setAccountContextLoading(false);
      }
      return;
    }

    try {
      setAccountContextLoading(true);
      const response = await fetch("/api/ai/account-context", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to identify the current account.");
      }
      if (!ignoreRequest) {
        setAccountContext({
          authenticated: Boolean(data.authenticated),
          role: data.role || "customer",
          sellerStatus: data.sellerStatus || null,
          active: Boolean(data.active),
          businessVerified: Boolean(data.businessVerified),
          storeId: data.storeId || null,
          storeName: data.storeName || null,
          username: data.username || null,
        });
      }
    } catch (error) {
      console.error("Adetɔ Boafo account-context error:", error);
      if (!ignoreRequest) {
        setAccountContext({
          authenticated: true,
          role: "customer",
          sellerStatus: null,
          active: false,
          businessVerified: false,
          storeId: null,
          storeName: null,
          username: null,
        });
      }
    } finally {
      if (!ignoreRequest) setAccountContextLoading(false);
    }
  };

  loadAccountContext();
  return () => { ignoreRequest = true; };
}, [isLoaded, isSignedIn]);

const quickActions = useMemo(() => {
  if (!isSignedIn) return GUEST_QUICK_ACTIONS;
  if (accountContext.role === "admin") return ADMIN_QUICK_ACTIONS;
  if (accountContext.role === "seller") {
    return accountContext.sellerStatus === "approved" && accountContext.active
      ? SELLER_QUICK_ACTIONS
      : PENDING_SELLER_QUICK_ACTIONS;
  }
  return CUSTOMER_QUICK_ACTIONS;
}, [accountContext.active, accountContext.role, accountContext.sellerStatus, isSignedIn]);

useEffect(() => {
  let ignoreRequest = false;

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await fetch(
        "/api/ai/categories",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load assistant categories."
        );
      }

      const data = await response.json();

      if (!ignoreRequest) {
        setCategoryTree(
          Array.isArray(data.categories)
            ? data.categories
            : []
        );
      }
    } catch (error) {
      console.error(
        "Adetɔ Boafo category error:",
        error
      );

      if (!ignoreRequest) {
        setCategoryTree([]);
      }
    } finally {
      if (!ignoreRequest) {
        setCategoriesLoading(false);
      }
    }
  };

  loadCategories();

  return () => {
    ignoreRequest = true;
  };
}, []);

useEffect(() => {
  let ignoreRequest = false;

  const loadCatalogueTerms = async () => {
    try {
      setCatalogueTermsLoading(true);

      const response = await fetch(
        "/api/ai/catalog-terms",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load assistant catalogue terms."
        );
      }

      const data = await response.json();

      if (!ignoreRequest) {
        setCatalogueTerms({
          brands: Array.isArray(data.brands)
            ? data.brands
            : [],

          productNames: Array.isArray(
            data.productNames
          )
            ? data.productNames
            : [],
        });
      }
    } catch (error) {
      console.error(
        "Adetɔ Boafo catalogue terms error:",
        error
      );

      if (!ignoreRequest) {
        setCatalogueTerms({
          brands: [],
          productNames: [],
        });
      }
    } finally {
      if (!ignoreRequest) {
        setCatalogueTermsLoading(false);
      }
    }
  };

  loadCatalogueTerms();

  return () => {
    ignoreRequest = true;
  };
}, []);

  const {
    language,
    changeLanguage,
    assistantOpen,
    openAssistant: openAssistantContext,
    closeAssistant: closeAssistantContext,
    startTour,
  } = useAdetoBoafo();

  const content = adetoBoafoContent[language];

  const firstName =
    user?.firstName ||
    user?.fullName?.split(" ")?.[0] ||
    user?.username ||
    "";

  const greeting = useMemo(() => {
    if (isSignedIn && firstName) {
      return content.userGreeting(firstName);
    }

    return content.guestGreeting;
  }, [content, firstName, isSignedIn]);

  const accountLabel = useMemo(() => {
    if (accountContextLoading) return "Identifying account...";
    if (!isSignedIn) return "Guest shopper";
    if (accountContext.role === "admin") return "Platform administrator";
    if (accountContext.role === "seller") {
      if (accountContext.sellerStatus === "approved" && accountContext.active) {
        return accountContext.storeName
          ? `Seller · ${accountContext.storeName}`
          : "Approved seller";
      }
      if (accountContext.sellerStatus === "rejected") {
        return "Seller application rejected";
      }
      return "Seller application pending";
    }
    return "Customer account";
  }, [
    accountContext.active,
    accountContext.role,
    accountContext.sellerStatus,
    accountContext.storeName,
    accountContextLoading,
    isSignedIn,
  ]);

  useEffect(() => {
    setMounted(true);

    const savedLanguage = localStorage.getItem(TOUR_LANGUAGE_KEY);
    const welcomeSeen = localStorage.getItem(TOUR_SEEN_KEY);
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);

    if (savedLanguage === "en" || savedLanguage === "tw") {
      changeLanguage(savedLanguage);
    }

    const isNewVisitor = !welcomeSeen && !tourCompleted;
    setIsFirstVisit(isNewVisitor);

    if (isNewVisitor) {
      const openTimer = setTimeout(() => {
       setIsOpen(true);
       openAssistantContext();
    }, 1100);

      return () => clearTimeout(openTimer);
    }
}, [changeLanguage, openAssistantContext]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
    setShowFeatures(false);
    localStorage.setItem(TOUR_LANGUAGE_KEY, newLanguage);
  };

const closeAssistant = useCallback(() => {
  setIsOpen(false);
  setShowFeatures(false);

setChatInput("");
setAssistantReply("");
setAssistantProducts([]);
setSellerProducts([]);
setSellerOrders([]);
setSellerAnalytics(null);
setProductSearchError("");
setIsAssistantThinking(false);

  closeAssistantContext();

  localStorage.setItem(TOUR_SEEN_KEY, "true");
}, [closeAssistantContext]);

  const handleExplore = () => {
    closeAssistant();
  };

  const handleStartTour = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, "true");
    setIsOpen(false);
    setShowFeatures(false);

    startTour(0);
  }, [startTour]);

  const handleRestartTour = useCallback(() => {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  localStorage.setItem(TOUR_SEEN_KEY, "true");

  setIsOpen(false);
  setShowFeatures(false);

  startTour(0);
}, [startTour]);

const handleQuickAction = useCallback(
  (action) => {
    if (!action) return;

    setIsOpen(false);
    setShowFeatures(false);
    closeAssistantContext();

    // Open Clerk login modal
    if (action.id === "signin") {
      openSignIn();
      return;
    }

    router.push(action.href);
  },
  [closeAssistantContext, openSignIn, router]
);

const handleChatSubmit = useCallback(
  (event) => {
    event.preventDefault();

    const message = chatInput.trim();

    if (!message || isAssistantThinking) {
      return;
    }

const intent = detectIntent(
  message,
  categoryTree,
  catalogueTerms
);

console.log(
  "Adetɔ Boafo detected intent:",
  intent
);

setChatInput("");
setAssistantReply("");
setAssistantProducts([]);
setSellerProducts([]);
setSellerOrders([]);
setSellerAnalytics(null);
setProductSearchError("");
setIsAssistantThinking(true);

    window.setTimeout(async () => {
      try {
        switch (intent.type) {
          case "seller-product-search":
          case "seller-product-summary": {
            const isApprovedActiveSeller =
              accountContext.role === "seller" &&
              accountContext.sellerStatus === "approved" &&
              accountContext.active === true;

            if (!isApprovedActiveSeller) {
              setAssistantReply(
                "Seller product search is available only to approved and active sellers."
              );
              break;
            }

            const params = new URLSearchParams();

            if (intent.query?.trim()) {
              params.set("query", intent.query.trim());
            }

            params.set("status", intent.status || "all");
            params.set("limit", "12");

            const response = await fetch(
              `/api/ai/seller-products?${params.toString()}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data?.error ||
                  "Unable to search your store products."
              );
            }

            const products = Array.isArray(data?.products)
              ? data.products
              : [];

            const summary = data?.summary || {
              totalProducts: products.length,
              inStock: 0,
              lowStock: 0,
              outOfStock: 0,
              totalUnits: 0,
            };

            setSellerProducts(products);

            if (intent.type === "seller-product-summary") {
              setAssistantReply(
                `Your store has ${summary.totalProducts} ${
                  summary.totalProducts === 1
                    ? "product"
                    : "products"
                }. ${summary.inStock} in stock, ${
                  summary.lowStock
                } low in stock, and ${
                  summary.outOfStock
                } out of stock.`
              );
              break;
            }

            if (products.length === 0) {
              const queryText = intent.query?.trim()
                ? ` matching “${intent.query.trim()}”`
                : "";

              const statusText =
                intent.status && intent.status !== "all"
                  ? ` with ${intent.status.replaceAll("-", " ")} status`
                  : "";

              setAssistantReply(
                `I could not find any products in your store${queryText}${statusText}.`
              );
              break;
            }

            setAssistantReply(
              `I found ${products.length} ${
                products.length === 1 ? "product" : "products"
              } in your store.`
            );

            break;
          }

          case "seller-orders-list":
          case "seller-orders-summary":
          case "seller-order-search":
          case "seller-orders-by-status": {
  if (
    accountContext.role !== "seller" ||
    accountContext.sellerStatus !== "approved" ||
    !accountContext.active
  ) {
    setAssistantReply(
      "Only approved and active sellers can access seller order information."
    );
    break;
  }
  const params = new URLSearchParams();

  params.set("limit", "4");

  if (intent.type === "seller-order-search") {
    params.set("query", intent.query || "");
  }

  if (intent.type === "seller-orders-by-status") {
    params.set("status", intent.status || "all");
  }

  const response = await fetch(
    `/api/ai/seller-orders?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Unable to retrieve your store orders."
    );
  }

  const orders = Array.isArray(data?.orders)
    ? data.orders
    : [];
  setSellerOrders(orders);
 
  const summary = data?.summary || {};

  /*
   * We will render professional order cards
   * in the next step. For now, this confirms
   * the API and intent connection are working.
   */
  if (intent.type === "seller-orders-summary") {
    setAssistantReply(
      `Your store has ${summary.total || 0} order${
        summary.total === 1 ? "" : "s"
      }. ${summary.placed || 0} are newly placed, ${
        summary.processing || 0
      } are processing, ${summary.shipped || 0} are shipped, and ${
        summary.delivered || 0
      } are delivered. Your total order value is ${
        process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵"
      }${Number(summary.totalRevenue || 0).toLocaleString()}.`
    );

    break;
  }

  if (orders.length === 0) {
    if (intent.type === "seller-order-search") {
      setAssistantReply(
        `I could not find an order matching "${intent.query}".`
      );
    } else if (
      intent.type === "seller-orders-by-status"
    ) {
      setAssistantReply(
        `You currently have no ${intent.status} orders.`
      );
    } else {
      setAssistantReply(
        "No store orders were found."
      );
    }

    break;
  }

  if (intent.type === "seller-order-search") {
    setAssistantReply(
      `I found ${orders.length} order${
        orders.length === 1 ? "" : "s"
      } matching "${intent.query}".`
    );
  } else if (
    intent.type === "seller-orders-by-status"
  ) {
    setAssistantReply(
      `I found ${data.totalMatchingOrders || orders.length} ${
        intent.status
      } order${
        (data.totalMatchingOrders || orders.length) === 1
          ? ""
          : "s"
      }.`
    );
  } else {
    setAssistantReply(
      `You have ${data.totalMatchingOrders || orders.length} order${
        (data.totalMatchingOrders || orders.length) === 1
          ? ""
          : "s"
      }. Showing the ${
        orders.length === 1
          ? "most recent order"
          : `${orders.length} most recent orders`
      }.`
    );
  }

  console.log("Adetɔ Boafo seller orders:", orders );

  break;
         }

         case "seller-analytics": {
  if (
    accountContext.role !== "seller" ||
    accountContext.sellerStatus !== "approved" ||
    !accountContext.active
  ) {
    setAssistantReply(
      "Only approved and active sellers can access seller analytics."
    );
    break;
  }

  const response = await fetch(
    "/api/ai/seller-analytics"
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Unable to retrieve seller analytics."
    );
  }

  setSellerAnalytics(data.summary);

  setAssistantReply(
    "Here is your latest seller analytics."
  );

  break;
}
          case "product-search": {
            const filters = intent.filters || {};

            const response = await fetch(
              "/api/ai/search-products",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  brand: filters.brand || "",

                  query:
                    filters.query ||
                    filters.productName ||
                    message,

                  categoryId:
                    filters.category?.id || "",

                  subcategoryId:
                    filters.subcategory?.id || "",

                  childCategoryId:
                    filters.childCategory?.id || "",

                  minPrice:
                    filters.minPrice ?? null,

                  maxPrice:
                    filters.maxPrice ?? null,
                }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data?.error ||
                  "Unable to search for products."
              );
            }

            const products = Array.isArray(
              data?.products
            )
              ? data.products
              : [];

            setAssistantProducts(products);

            if (products.length > 0) {
              setAssistantReply(
                `I found ${products.length} product${
                  products.length === 1
                    ? ""
                    : "s"
                } matching your search.`
              );
            } else {
              setAssistantReply(
                "I could not find an exact product match. Try another brand, product name, category, or price range."
              );
            }

            break;
          }

          case "track-order": {
            setAssistantReply(
              "I can help you track your package. Opening the tracking page now."
            );

            window.setTimeout(() => {
              setIsOpen(false);
              setShowFeatures(false);
              closeAssistantContext();

              router.push("/track-order");
            }, 900);

            break;
          }

          case "cart": {
            setAssistantReply(
              "Opening your shopping cart."
            );

            window.setTimeout(() => {
              setIsOpen(false);
              setShowFeatures(false);
              closeAssistantContext();

              router.push("/cart");
            }, 800);

            break;
          }

          case "seller": {
            setAssistantReply(
              "I will take you to the seller registration section."
            );

            window.setTimeout(() => {
              setIsOpen(false);
              setShowFeatures(false);
              closeAssistantContext();

              router.push("/create-store");
            }, 900);

            break;
          }

          case "support": {
            setAssistantReply(
              "I will connect you with the Amoakay Deals support page."
            );

            window.setTimeout(() => {
              setIsOpen(false);
              setShowFeatures(false);
              closeAssistantContext();

              router.push("/contact");
            }, 900);

            break;
          }

          default: {
            setAssistantReply(
              "I can help you find products, open your cart, track an order, become a seller, or contact support."
            );
          }
        }
      } catch (error) {
        console.error(
          "Adetɔ Boafo product search error:",
          error
        );

        setAssistantProducts([]);
        setSellerProducts([]);
        setProductSearchError(
          error?.message ||
            "Something went wrong while searching."
        );

        setAssistantReply(
          "I could not complete the product search. Please try again."
        );
      } finally {
        setIsAssistantThinking(false);
      }
    }, 650);
  },
[
  accountContext.active,
  accountContext.role,
  accountContext.sellerStatus,
  catalogueTerms,
  categoryTree,
  chatInput,
  closeAssistantContext,
  isAssistantThinking,
  router,
]
);

 const openAssistant = useCallback(() => {
  setIsFirstVisit(false);
  setShowFeatures(true);
  setIsOpen(true);

  openAssistantContext();
}, [openAssistantContext]);

  if (!mounted || !isLoaded) {
    return null;
  }

  return (
    <>
     
     {/* ======================================================
    WIDE RESPONSIVE ADESƆ BOAFO ASSISTANT MODAL
====================================================== */}
{isOpen && (
  <div
    className="
      fixed inset-0 z-[9999]
      flex items-end justify-center
      overflow-hidden
      bg-slate-950/60
      backdrop-blur-[10px]
      sm:items-center
      sm:px-4 sm:py-5
      lg:px-8 lg:py-6
    "
    role="dialog"
    aria-modal="true"
    aria-labelledby="adeto-boafo-title"
  >
    {/* Decorative background lighting */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-green-500/20 blur-[100px]" />

      <div className="absolute -right-28 bottom-6 h-80 w-80 rounded-full bg-emerald-400/20 blur-[110px]" />

      <div className="absolute left-1/2 top-1/3 h-52 w-52 -translate-x-1/2 rounded-full bg-lime-300/10 blur-[95px]" />
    </div>

    <section
      className="
        adeto-welcome-card
        relative
        flex
        max-h-[96dvh]
        w-full
        flex-col
        overflow-hidden
        rounded-t-[28px]
        border border-white/70
        bg-white/95
        shadow-[0_-20px_80px_rgba(15,23,42,0.38)]
        backdrop-blur-2xl

        sm:max-h-[92vh]
        sm:max-w-[1120px]
        sm:rounded-[30px]
        sm:shadow-[0_30px_100px_rgba(15,23,42,0.42)]

        xl:max-w-[1180px]
      "
    >
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r from-lime-400 via-green-500 to-emerald-700" />

      {/* Background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div
        className="
          relative
          flex-1
          overflow-y-auto
          overscroll-contain
          px-4
          pb-[max(20px,env(safe-area-inset-bottom))]
          pt-5

          sm:px-6 sm:pb-6 sm:pt-6
          lg:px-8 lg:pb-7 lg:pt-7
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-800 text-white shadow-lg shadow-green-200 sm:h-12 sm:w-12">
              <Sparkles size={20} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-lime-400" />
            </div>

            <div className="min-w-0">
              <h2
                id="adeto-boafo-title"
                className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl"
              >
                {content.assistantName}
              </h2>

              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 sm:text-sm">
                  {content.assistantRole}
                </span>

                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-green-700 sm:text-[10px]">
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher
                language={language}
                onChange={handleLanguageChange}
              />
            </div>

            <button
              type="button"
              onClick={closeAssistant}
              aria-label={content.close}
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full border border-slate-200 bg-white
                text-slate-500 shadow-sm
                transition
                hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900
              "
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Mobile language switcher */}
        <div className="mt-4 flex justify-end sm:hidden">
          <LanguageSwitcher
            language={language}
            onChange={handleLanguageChange}
          />
        </div>

        {/* Main horizontal assistant area */}
        <div
          className="
            mt-4
            grid
            gap-4

            md:grid-cols-[170px_minmax(0,1fr)]
            md:items-start
            md:gap-5

            lg:grid-cols-[210px_minmax(0,1fr)]
            lg:gap-7
          "
        >
          {/* Orb panel */}
          
  <aside
   className="
    relative
    hidden
    h-[390px]
    overflow-hidden
    rounded-[24px]
    border border-green-100/80
    bg-gradient-to-br from-green-50/90 via-white to-emerald-50/80
    p-4
    shadow-[0_15px_40px_rgba(22,163,74,0.09)]

    md:sticky
    md:top-4
    md:flex
    md:flex-col
    md:items-center
    md:justify-center

    lg:h-[420px]
  "
>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.14),transparent_60%)]" />

            <div className="absolute left-5 top-6 h-2 w-2 rounded-full bg-lime-400" />

            <div className="absolute right-6 top-16 h-1.5 w-1.5 rounded-full bg-green-400" />

            <div className="absolute bottom-14 left-7 h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <div className="relative flex flex-col items-center">
              <FloatingOrb size="large" state="idle" />

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-green-700 shadow-sm">
                <span className="flex gap-1">
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>

                {content.typing}
              </div>
            </div>
          </aside>

          {/* Message and chat panel */}
          <div
            className="
              min-w-0
              rounded-[24px]
              border border-slate-200/80
              bg-gradient-to-br from-white to-slate-50/90
              p-4
              shadow-[0_15px_40px_rgba(15,23,42,0.08)]

              sm:p-5
              lg:p-6
            "
          >
            {/* Mobile orb */}
            <div className="mb-4 flex items-center gap-3 md:hidden">
              <FloatingOrb size="small" state="idle" />

              <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50/90 px-3 py-1.5 text-[10px] font-bold text-green-700">
                <span className="flex gap-1">
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="adeto-typing-dot h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>

                {content.typing}
              </div>
            </div>

            <TypingText
              key={`${language}-${greeting}`}
              text={greeting}
              speed={24}
              startDelay={150}
              onComplete={() => setShowFeatures(true)}
              className="
                text-xl font-black leading-tight tracking-tight text-slate-950
                sm:text-2xl
                lg:text-[28px]
              "
            />

            <p
              className={`mt-3 text-sm leading-6 text-slate-600 transition-all duration-700 sm:text-[15px] ${
                showFeatures
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              {content.introduction}
            </p>

            {/* Quick actions */}
            {showFeatures && (
              <div className="mt-4">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                    {isSignedIn
                      ? "Recommended for you"
                      : "Start here"}
                  </p>

                  {isSignedIn && firstName && (
                    <div className="flex max-w-[190px] flex-col items-end">
                      <span className="max-w-full truncate rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                        Hi, {firstName}
                      </span>
                      <span className="mt-1 max-w-full truncate text-[9px] font-semibold text-slate-400">
                        {accountLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() =>
                          handleQuickAction(action)
                        }
                        className="
                          group
                          flex items-center gap-2
                          rounded-full
                          border border-slate-200
                          bg-white
                          px-3.5 py-2
                          text-xs font-semibold text-slate-700
                          shadow-sm
                          transition-all duration-300

                          hover:-translate-y-0.5
                          hover:border-green-300
                          hover:bg-green-50
                          hover:text-green-700
                          hover:shadow-md

                          sm:text-sm
                        "
                      >
                        <Icon
                          size={15}
                          className="transition-transform group-hover:scale-110"
                        />

                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI chat */}
            {showFeatures && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                  Ask Adetɔ Boafo
                </p>

                {(isAssistantThinking ||
                  assistantReply) && (
                  <div className="mb-3 rounded-2xl border border-green-100 bg-green-50/80 p-3">
                    <div className="flex items-start gap-3">
                      <FloatingOrb
                        size="small"
                        state={
                          isAssistantThinking
                            ? "thinking"
                            : "speaking"
                        }
                      />

                      <div className="min-w-0 flex-1">
                        {isAssistantThinking ? (
                          <div className="flex items-center gap-1.5 py-2">
                            <span className="adeto-thinking-dot h-2 w-2 rounded-full bg-green-500" />
                            <span className="adeto-thinking-dot h-2 w-2 rounded-full bg-green-500" />
                            <span className="adeto-thinking-dot h-2 w-2 rounded-full bg-green-500" />
                          </div>
                        ) : (
                          <p className="text-sm font-semibold leading-6 text-slate-700">
                            {assistantReply}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {productSearchError && (
  <div
    className="
      mb-3
      rounded-2xl
      border border-red-200
      bg-red-50
      px-4 py-3
      text-sm
      font-semibold
      text-red-700
    "
  >
    {productSearchError}
  </div>
)}

{assistantProducts.length > 0 && (
  <div className="mb-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-black text-slate-900">
          Products for you
        </p>

        <p className="text-xs text-slate-500">
          Swipe or scroll to see more products.
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700">
        {assistantProducts.length} found
      </span>
    </div>

    <div
      className="
        flex
        gap-4
        overflow-x-auto
        overscroll-x-contain
        pb-4
      "
    >
      {assistantProducts.map((product) => (
        <AssistantProductCard
          key={product.id}
          product={product}
          onCloseAssistant={closeAssistant}
        />
      ))}
    </div>
  </div>
)}



{sellerProducts.length > 0 && (
  <div className="mb-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-black text-slate-900">
          Your store products
        </p>

        <p className="text-xs text-slate-500">
          Product and stock information from your store.
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700">
        {sellerProducts.length} found
      </span>
    </div>

    <div className="flex gap-4 overflow-x-auto overscroll-x-contain pb-4">
      {sellerProducts.map((product) => {
        const stock =
          product.effectiveStock ??
          product.stock ??
          0;

        const inventoryStatus =
          product.inventoryStatus ||
          (stock <= 0
            ? "out-of-stock"
            : stock <= 5
              ? "low-stock"
              : "in-stock");

        const statusLabel =
          inventoryStatus === "out-of-stock"
            ? "Out of stock"
            : inventoryStatus === "low-stock"
              ? "Low stock"
              : "In stock";

        const statusClass =
          inventoryStatus === "out-of-stock"
            ? "bg-red-100 text-red-700"
            : inventoryStatus === "low-stock"
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700";

        const image =
          product.image ||
          product.images?.[0] ||
          "";

        return (
          <article
            key={product.id}
            className="w-[230px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <ShoppingBag size={34} />
                </div>
              )}
            </div>

            <div className="p-3">
              <p className="line-clamp-2 text-sm font-black text-slate-900">
                {product.name}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-green-700">
                  GH₵ {Number(product.price || 0).toLocaleString()}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-[9px] font-black ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-600">
                  Stock
                </span>

                <span className="text-xs font-black text-slate-900">
                  {stock}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeAssistantContext();
                  setIsOpen(false);
                  router.push("/store/manage-product");
                }}
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
              >
                Manage Product
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </div>
)}
{sellerOrders.length > 0 && (
  <div className="mb-4">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-black text-slate-900">
          Your store orders
        </p>

        <p className="text-xs text-slate-500">
          Recent customer orders from your store.
        </p>
      </div>

      <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-700">
        {sellerOrders.length} found
      </span>
    </div>

    <div className=" flex gap-5 overflow-x-auto overscroll-x-contain pb-5 snap-x snap-mandatory ">
      
{sellerOrders.map((order) => (
  <SellerOrderCard
    key={order.id}
    order={order}
    onViewOrder={(selectedOrder) => {
      setIsOpen(false);
      setShowFeatures(false);

      closeAssistantContext();

      document.body.style.overflow = "";

      const selectedOrderId =
        selectedOrder?.id || order.id;

      window.setTimeout(() => {
        router.push(
          `/store/orders?orderId=${encodeURIComponent(
            selectedOrderId
          )}`
        );
      }, 100);
    }}
  />
))}

    </div>
  </div>
)}

{sellerAnalytics && (
  <SellerAnalyticsCard
    summary={sellerAnalytics}
  />
)}
                <form
                  onSubmit={handleChatSubmit}
                  className="
                    flex items-center gap-2
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    p-2
                    shadow-sm
                    transition

                    focus-within:border-green-400
                    focus-within:ring-4
                    focus-within:ring-green-100
                  "
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(event) =>
                      setChatInput(event.target.value)
                    }
                    disabled={
                      isAssistantThinking ||
                       categoriesLoading ||
                       catalogueTermsLoading
                    }
                    placeholder={
                    categoriesLoading ||
                    catalogueTermsLoading
                   ? "Loading marketplace catalogue..."
                   : "Find phones, laptops, accessories..."
                    }
                    aria-label="Ask Adetɔ Boafo"
                    className="
                      min-w-0 flex-1
                      bg-transparent
                      px-2 py-2.5
                      text-sm text-slate-800
                      outline-none
                      placeholder:text-slate-400
                    "
                  />

                  <button
                    type="submit"
                    disabled={
                      !chatInput.trim() ||
                      isAssistantThinking ||
                      categoriesLoading ||
                      catalogueTermsLoading
                     }
                    aria-label="Send message"
                    className="
                      flex h-11 w-11 shrink-0 items-center justify-center
                      rounded-xl
                      bg-gradient-to-r from-green-600 to-emerald-700
                      text-white
                      shadow-md
                      transition

                      hover:-translate-y-0.5
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Send size={17} />
                  </button>
                </form>

                <p className="mt-2 text-[10px] leading-4 text-slate-400">
                  Try: “Find Samsung phones”, “Open my
                  cart” or “Track my order”.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Compact feature cards */}
        <div
          className={`mt-4 grid grid-cols-2 gap-2.5 transition-all duration-700 sm:grid-cols-4 ${
            showFeatures
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {content.features.map((feature, index) => {
            const icons = [
              ShoppingBag,
              Compass,
              Check,
              ChevronRight,
            ];

            const FeatureIcon =
              icons[index] || Check;

            return (
              <div
                key={feature}
                className="
                  group
                  flex min-h-[92px]
                  items-start gap-3
                  rounded-2xl
                  border border-slate-200/80
                  bg-white/80
                  p-3
                  shadow-sm
                  transition duration-300

                  hover:-translate-y-0.5
                  hover:border-green-200
                  hover:shadow-lg
                  hover:shadow-green-100/70

                  sm:min-h-[98px]
                "
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-600 group-hover:text-white">
                  <FeatureIcon size={16} />
                </span>

                <p className="text-xs font-bold leading-5 text-slate-700 sm:text-sm">
                  {feature}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div
          className={`mt-4 flex flex-col gap-2.5 transition-all duration-700 sm:flex-row sm:items-center sm:justify-between ${
            showFeatures
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={handleExplore}
            className="
              order-2
              flex min-h-11 items-center justify-center
              rounded-2xl
              border border-slate-200
              bg-white
              px-5
              text-sm font-bold text-slate-700
              transition

              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-950

              sm:order-1
            "
          >
            {content.explore}
          </button>

          {isFirstVisit ? (
            <button
              type="button"
              onClick={handleStartTour}
              className="
                group order-1
                flex min-h-11 items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-r from-green-600 via-emerald-600 to-green-700
                px-6
                text-sm font-black text-white
                shadow-[0_12px_30px_rgba(22,163,74,0.3)]
                transition

                hover:-translate-y-0.5
                hover:shadow-[0_18px_40px_rgba(22,163,74,0.38)]

                sm:order-2
              "
            >
              <Sparkles size={17} />

              {content.startTour}

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestartTour}
              className="
                group order-1
                flex min-h-11 items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-r from-green-600 to-emerald-700
                px-6
                text-sm font-black text-white
                shadow-lg shadow-green-200
                transition

                hover:-translate-y-0.5

                sm:order-2
              "
            >
              <RotateCcw size={17} />

              {content.restartTour}
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] font-medium leading-4 text-slate-400 sm:text-xs">
          Amoakay Deals · Dwa papa fie!
        </p>
      </div>
    </section>
  </div>
)}

      {/* ======================================================
          PERSISTENT FLOATING ASSISTANT BUTTON
      ====================================================== */}
      {!isOpen && (
        <button
          type="button"
          onClick={openAssistant}
          aria-label={`${content.assistantName}: ${content.openAssistant}`}
          className="adeto-floating-button group fixed bottom-[max(18px,env(safe-area-inset-bottom))] right-4 z-[9000] flex items-center gap-2 rounded-full border border-white/70 bg-white/95 p-2 pr-3 shadow-[0_18px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(22,163,74,0.25)] sm:bottom-6 sm:right-6 sm:gap-3 sm:p-2.5 sm:pr-4"
        >
          <FloatingOrb size="small" state="idle" />

          <span className="hidden min-w-0 text-left xs:block">
            <span className="block truncate text-xs font-black text-slate-950 sm:text-sm">
              {content.assistantName}
            </span>

            <span className="block truncate text-[10px] font-semibold text-slate-500 sm:text-xs">
              {content.openAssistant}
            </span>
          </span>

          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </button>
      )}   
           <TourEngine />
    </>
  );
};

export default AdetoBoafo;