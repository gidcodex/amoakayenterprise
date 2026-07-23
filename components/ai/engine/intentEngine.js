import { matchCategoryHierarchy } from "./categoryMatcher";
import { parseProductSearch } from "./searchParser";

const PRODUCT_WORDS = [
  "product",
  "products",
  "buy",
  "find",
  "show",
  "search",
  "phone",
  "phones",
  "smartphone",
  "smartphones",
  "laptop",
  "laptops",
  "computer",
  "computers",
  "tablet",
  "tablets",
  "television",
  "televisions",
  "tv",
  "headphone",
  "headphones",
  "earbud",
  "earbuds",
  "camera",
  "cameras",
  "accessory",
  "accessories",
  "speaker",
  "speakers",
  "charger",
  "chargers",
  "watch",
  "watches",
  "appliance",
  "appliances",
];

const containsAnyPhrase = (text, phrases = []) => {
  return phrases.some((phrase) => text.includes(phrase));
};

/*
 * Removes seller-search command words and returns
 * only the actual product name or brand.
 */
const cleanSellerProductQuery = (message = "") => {
  return String(message)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(
      /\b(out of stock|out-of-stock|low stock|low-stock|in stock|in-stock|running low|almost out of stock|nearly out of stock|sold out|zero stock|no stock|available stock)\b/g,
      " "
    )
    .replace(
      /\b(show|find|search|list|display|view|check|give|tell|open|which|what|where|how|many|do|i|have|are|is|all|please|can|you|me)\b/g,
      " "
    )
    .replace(
      /\b(my|store|seller|own|product|products|item|items|inventory|stock|listing|listings)\b/g,
      " "
    )
    .replace(/[?!.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export function detectIntent(
  message = "",
  categoryTree = [],
  catalogueTerms = {}
) {
  const text = String(message)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return {
      type: "unknown",
    };
  }

  /*
   * =====================================================
   * SELLER NAVIGATION ACTIONS
   * =====================================================
   */

  if (
    containsAnyPhrase(text, [
      "seller dashboard",
      "store dashboard",
      "my dashboard",
      "open dashboard",
      "open my dashboard",
      "go to dashboard",
      "manage my store",
      "open my store",
    ])
  ) {
    return {
      type: "seller-dashboard",
    };
  }

  if (
    containsAnyPhrase(text, [
      "add product",
      "add a product",
      "add new product",
      "add a new product",
      "create product",
      "create a product",
      "create new product",
      "create a new product",
      "list a product",
      "list new product",
      "upload product",
      "upload a product",
    ])
  ) {
    return {
      type: "seller-add-product",
    };
  }

  /*
   * Product-management navigation must be checked
   * before seller product search.
   */
  if (
    containsAnyPhrase(text, [
      "manage product",
      "manage products",
      "manage my product",
      "manage my products",
      "open product management",
      "open my product management",
      "product management",
      "product management page",
      "manage product listings",
      "manage my listings",
      "edit my product",
      "edit my products",
      "delete my product",
      "delete my products",
      "open my products",
      "open my listings",
    ])
  ) {
    return {
      type: "seller-manage-products",
    };
  }

  /*
   * =====================================================
   * SELLER PRODUCT AND INVENTORY SEARCH
   * =====================================================
   */

  const sellerProductReference =
    /\bmy\s+(product|products|item|items|listing|listings|inventory|stock)\b/.test(
      text
    ) ||
    /\bmy\s+store\s+(product|products|item|items|listing|listings)\b/.test(
      text
    ) ||
    /\b(product|products|item|items)\s+in\s+my\s+store\b/.test(
      text
    ) ||
    /\b(store|seller)\s+(product|products|item|items)\b/.test(
      text
    );

  const sellerProductAction =
    /\b(show|find|search|list|display|view|check)\b/.test(text);

  const asksForLowStock =
    /\b(low stock|low-stock|running low|almost out of stock|nearly out of stock)\b/.test(
      text
    );

  const asksForOutOfStock =
    /\b(out of stock|out-of-stock|sold out|zero stock|no stock)\b/.test(
      text
    );

  const asksForInStock =
    /\b(in stock|in-stock|available stock|available products)\b/.test(
      text
    );

  const asksForProductCount =
    /\bhow many\s+(product|products|item|items|listing|listings)\b/.test(
      text
    ) ||
    /\b(number|total|count)\s+of\s+(my\s+)?(product|products|item|items|listing|listings)\b/.test(
      text
    ) ||
    containsAnyPhrase(text, [
      "count my products",
      "count my product",
      "total products",
      "total product",
      "total number of products",
      "how many products do i have",
      "how many product do i have",
      "how many items do i have",
      "how many listings do i have",
    ]);

  const asksToSearchSellerProducts = containsAnyPhrase(text, [
    "show my product",
    "show my products",
    "find my product",
    "find my products",
    "search my product",
    "search my products",
    "view my product",
    "view my products",
    "display my product",
    "display my products",
    "list my product",
    "list my products",
    "check my product",
    "check my products",
    "show my item",
    "show my items",
    "find my item",
    "find my items",
    "search my item",
    "search my items",
    "show my listing",
    "show my listings",
    "find my listing",
    "find my listings",
  ]);

  const asksForInventoryFilteredProducts =
    asksForLowStock ||
    asksForOutOfStock ||
    asksForInStock;

  if (asksForProductCount) {
    return {
      type: "seller-product-summary",
      query: "",
      status: "all",
    };
  }

  if (
    sellerProductReference &&
    (sellerProductAction ||
      asksToSearchSellerProducts ||
      asksForInventoryFilteredProducts)
  ) {
    let status = "all";

    if (asksForOutOfStock) {
      status = "out-of-stock";
    } else if (asksForLowStock) {
      status = "low-stock";
    } else if (asksForInStock) {
      status = "in-stock";
    }

    return {
      type: "seller-product-search",
      query: cleanSellerProductQuery(text),
      status,
    };
  }

  /*
   * Support inventory-filtered seller searches such as:
   * "Which products are out of stock?"
   */
  if (
    asksForInventoryFilteredProducts &&
    /\b(product|products|item|items|inventory|stock)\b/.test(text)
  ) {
    let status = "all";

    if (asksForOutOfStock) {
      status = "out-of-stock";
    } else if (asksForLowStock) {
      status = "low-stock";
    } else if (asksForInStock) {
      status = "in-stock";
    }

    return {
      type: "seller-product-search",
      query: cleanSellerProductQuery(text),
      status,
    };
  }

  /*
   * =====================================================
   * SELLER ORDER INTELLIGENCE
   * =====================================================
   */

  if (
    /\b(how many orders|order summary|orders summary|my orders summary|total orders|order statistics|orders statistics)\b/.test(
      text
    )
  ) {
    return {
      type: "seller-orders-summary",
    };
  }

  const sellerOrderSearch = text.match(
    /\b(find|search|locate|open|show)\s+(order|tracking)\s+(.+)/
  );

  if (sellerOrderSearch) {
    return {
      type: "seller-order-search",
      query: sellerOrderSearch[3].trim(),
    };
  }

  const sellerStatusMatch = text.match(
    /\b(pending|placed|processing|processed|shipped|delivered)\s+orders?\b/
  );

  if (sellerStatusMatch) {
    return {
      type: "seller-orders-by-status",
      status: sellerStatusMatch[1].toLowerCase(),
    };
  }

  if (
    containsAnyPhrase(text, [
      "seller order",
      "seller orders",
      "store order",
      "store orders",
      "customer order",
      "customer orders",
      "my seller orders",
      "my store orders",
      "show my orders",
      "view my orders",
      "open my orders",
      "check my orders",
      "recent orders",
      "latest orders",
      "new orders",
      "all orders",
    ])
  ) {
    return {
      type: "seller-orders-list",
    };
  }

  /*
   * =====================================================
   * SELLER ANALYTICS
   * =====================================================
   */

  if (
    containsAnyPhrase(text, [
      "seller analytics",
      "store analytics",
      "my analytics",
      "show analytics",
      "show my analytics",
      "view analytics",
      "view my analytics",
      "business summary",
      "store performance",
      "seller performance",
      "business performance",
      "sales performance",
      "sales summary",
      "revenue summary",
      "my revenue",
      "store revenue",
      "seller revenue",
      "total revenue",
      "today revenue",
      "todays revenue",
      "revenue today",
      "monthly revenue",
      "this month revenue",
      "revenue this month",
      "my earnings",
      "seller earnings",
      "store earnings",
      "total earnings",
      "how much have i sold",
      "how much did i sell",
      "how much have i earned",
      "how much did i earn",
      "best selling product",
      "best-selling product",
      "top selling product",
      "top-selling product",
      "best seller product",
      "highest selling product",
    ])
  ) {
    return {
      type: "seller-analytics",
    };
  }

  /*
   * =====================================================
   * OTHER SELLER ACTIONS
   * =====================================================
   */

  if (
    containsAnyPhrase(text, [
      "open inventory",
      "open my inventory",
      "go to inventory",
      "inventory dashboard",
      "inventory page",
      "manage inventory",
      "manage my inventory",
      "update inventory",
      "update my inventory",
      "manage stock",
      "update stock",
      "inventory management",
    ])
  ) {
    return {
      type: "seller-inventory",
    };
  }

  if (
    containsAnyPhrase(text, [
      "variant inventory",
      "product variants",
      "manage variants",
      "variant stock",
      "stock variants",
      "manage variant inventory",
      "open variant inventory",
    ])
  ) {
    return {
      type: "seller-variant-inventory",
    };
  }

  if (
    containsAnyPhrase(text, [
      "seller notification",
      "seller notifications",
      "store notification",
      "store notifications",
      "my notifications",
      "open notifications",
      "view notifications",
      "check notifications",
    ])
  ) {
    return {
      type: "seller-notifications",
    };
  }

  if (
    containsAnyPhrase(text, [
      "customer question",
      "customer questions",
      "product question",
      "product questions",
      "buyer question",
      "buyer questions",
      "view questions",
      "answer questions",
      "respond to questions",
      "open questions",
    ])
  ) {
    return {
      type: "seller-questions",
    };
  }

  if (
    containsAnyPhrase(text, [
      "seller return",
      "seller returns",
      "store return",
      "store returns",
      "customer return",
      "customer returns",
      "return request",
      "return requests",
      "manage returns",
      "view returns",
      "open returns",
    ])
  ) {
    return {
      type: "seller-returns",
    };
  }

  if (
    containsAnyPhrase(text, [
      "seller reviews",
      "store reviews",
      "product reviews",
      "my reviews",
      "customer reviews",
      "view reviews",
      "open reviews",
      "check reviews",
    ])
  ) {
    return {
      type: "seller-reviews",
    };
  }

  if (
    containsAnyPhrase(text, [
      "payout settings",
      "seller payout",
      "seller payouts",
      "store payout",
      "store payouts",
      "payment settings",
      "payout account",
      "payout method",
      "manage payout",
      "manage payouts",
      "open payout settings",
    ])
  ) {
    return {
      type: "seller-payout-settings",
    };
  }

  /*
   * =====================================================
   * CUSTOMER AND GENERAL ACTIONS
   * =====================================================
   */

  if (
    containsAnyPhrase(text, [
      "track order",
      "track my order",
      "track package",
      "track my package",
      "track shipment",
      "track my shipment",
      "shipment status",
      "delivery status",
      "where is my order",
      "where is my package",
    ])
  ) {
    return {
      type: "track-order",
    };
  }

  if (
    containsAnyPhrase(text, [
      "open cart",
      "open my cart",
      "show cart",
      "show my cart",
      "view cart",
      "view my cart",
      "shopping cart",
      "my cart",
      "go to cart",
      "checkout",
    ])
  ) {
    return {
      type: "cart",
    };
  }

  if (
    containsAnyPhrase(text, [
      "become a seller",
      "register as a seller",
      "apply as a seller",
      "start selling",
      "sell on amoakay",
      "sell on amoakay deals",
      "open a store",
      "create a store",
      "seller registration",
      "seller application",
    ])
  ) {
    return {
      type: "seller",
    };
  }

  if (
    containsAnyPhrase(text, [
      "contact support",
      "customer support",
      "customer service",
      "support team",
      "help centre",
      "help center",
      "contact amoakay",
      "contact us",
      "get support",
      "need help",
    ])
  ) {
    return {
      type: "support",
    };
  }

  /*
   * =====================================================
   * PUBLIC PRODUCT SEARCH
   * =====================================================
   */

  const categoryMatch = matchCategoryHierarchy(
    text,
    categoryTree
  );

  const parsedSearch = parseProductSearch(
    text,
    catalogueTerms
  );

  const containsProductWord = PRODUCT_WORDS.some(
    (word) => text.includes(word)
  );

  const hasLiveCatalogueMatch =
    Boolean(parsedSearch.brand) ||
    Boolean(parsedSearch.productName);

  const hasProductFilter =
    hasLiveCatalogueMatch ||
    Boolean(categoryMatch.category) ||
    parsedSearch.minPrice !== null ||
    parsedSearch.maxPrice !== null;

  if (containsProductWord || hasProductFilter) {
    return {
      type: "product-search",

      filters: {
        brand: parsedSearch.brand,
        productName: parsedSearch.productName,
        query: parsedSearch.query,
        minPrice: parsedSearch.minPrice,
        maxPrice: parsedSearch.maxPrice,
        category: categoryMatch.category,
        subcategory: categoryMatch.subcategory,
        childCategory: categoryMatch.childCategory,
      },
    };
  }

  return {
    type: "unknown",
  };
}