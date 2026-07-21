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
];

export function detectIntent(
  message = "",
  categoryTree = []
) {
  const text = message.toLowerCase().trim();

  const categoryMatch = matchCategoryHierarchy(
    text,
    categoryTree
  );

  const parsedSearch = parseProductSearch(text);

  const containsProductWord = PRODUCT_WORDS.some(
    (word) => text.includes(word)
  );

  const hasProductFilter =
    Boolean(parsedSearch.brand) ||
    Boolean(categoryMatch.category) ||
    parsedSearch.minPrice !== null ||
    parsedSearch.maxPrice !== null;

  if (containsProductWord || hasProductFilter) {
    return {
      type: "product-search",

      filters: {
        brand: parsedSearch.brand,
        minPrice: parsedSearch.minPrice,
        maxPrice: parsedSearch.maxPrice,

        category: categoryMatch.category,
        subcategory: categoryMatch.subcategory,
        childCategory: categoryMatch.childCategory,
      },
    };
  }

  if (
    text.includes("track") ||
    text.includes("shipment") ||
    text.includes("delivery status")
  ) {
    return {
      type: "track-order",
    };
  }

  if (text.includes("cart")) {
    return {
      type: "cart",
    };
  }

  if (
    text.includes("seller") ||
    text.includes("sell on") ||
    text.includes("open a store")
  ) {
    return {
      type: "seller",
    };
  }

  if (
    text.includes("support") ||
    text.includes("contact") ||
    text.includes("customer service")
  ) {
    return {
      type: "support",
    };
  }

  return {
    type: "unknown",
  };
}