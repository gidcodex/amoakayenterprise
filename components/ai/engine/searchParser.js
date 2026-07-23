const SEARCH_FILLER_WORDS = new Set([
  "a",
  "an",
  "and",
  "any",
  "are",
  "buy",
  "can",
  "could",
  "display",
  "find",
  "for",
  "give",
  "i",
  "in",
  "is",
  "looking",
  "me",
  "need",
  "of",
  "please",
  "product",
  "products",
  "search",
  "show",
  "some",
  "the",
  "to",
  "want",
  "with",
  "you",
]);

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLiveBrand(
  text,
  catalogueTerms = {}
) {
  const normalizedText = normalizeText(text);

  const brands = Array.isArray(
    catalogueTerms.brands
  )
    ? catalogueTerms.brands
    : [];

  const matchingBrands = brands.filter(
    (brand) => {
      const normalizedBrand =
        normalizeText(brand);

      if (!normalizedBrand) {
        return false;
      }

      const brandPattern = new RegExp(
        `(^|\\s)${escapeRegExp(
          normalizedBrand
        )}(?=\\s|$)`,
        "i"
      );

      return brandPattern.test(
        normalizedText
      );
    }
  );

  if (matchingBrands.length === 0) {
    return null;
  }

  return matchingBrands.sort(
    (a, b) => b.length - a.length
  )[0];
}

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function detectProductName(
  text,
  catalogueTerms = {}
) {
  const normalizedText = normalizeText(text);

  const productNames = Array.isArray(
    catalogueTerms.productNames
  )
    ? catalogueTerms.productNames
    : [];

  const matchingProducts =
    productNames.filter((productName) => {
      const normalizedProductName =
        normalizeText(productName);

      return (
        normalizedProductName &&
        normalizedText.includes(
          normalizedProductName
        )
      );
    });

  if (matchingProducts.length === 0) {
    return null;
  }

  return matchingProducts.sort(
    (a, b) => b.length - a.length
  )[0];
}

function detectPriceFilters(text) {
  const maxPriceMatch =
    text.match(
      /(?:under|below|less than|maximum|max)\s*(?:ghs|gh₵|₵|€|\$|£)?\s*([\d,.]+)/i
    ) ||
    text.match(
      /(?:ghs|gh₵|₵|€|\$|£)\s*([\d,.]+)\s*(?:or less|maximum|max)/i
    );

  const minPriceMatch =
    text.match(
      /(?:above|over|more than|minimum|min)\s*(?:ghs|gh₵|₵|€|\$|£)?\s*([\d,.]+)/i
    ) ||
    text.match(
      /(?:ghs|gh₵|₵|€|\$|£)\s*([\d,.]+)\s*(?:or more|minimum|min)/i
    );

  const convertPrice = (match) => {
    if (!match?.[1]) {
      return null;
    }

    const number = Number(
      match[1].replace(/,/g, "")
    );

    return Number.isFinite(number)
      ? number
      : null;
  };

  return {
    minPrice: convertPrice(minPriceMatch),
    maxPrice: convertPrice(maxPriceMatch),
  };
}

function removePriceLanguage(text) {
  return text
    .replace(
      /(?:under|below|less than|maximum|max|above|over|more than|minimum|min)\s*(?:ghs|gh₵|₵|€|\$|£)?\s*[\d,.]+/gi,
      " "
    )
    .replace(
      /(?:ghs|gh₵|₵|€|\$|£)\s*[\d,.]+\s*(?:or less|or more|maximum|max|minimum|min)?/gi,
      " "
    );
}

function buildSearchQuery(
  text,
  detectedBrand,
  detectedProductName
) {
  if (detectedProductName) {
    return detectedProductName;
  }

  const textWithoutPrices =
    removePriceLanguage(text);

  const words = normalizeText(
    textWithoutPrices
  )
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (word) =>
        !SEARCH_FILLER_WORDS.has(word)
    );

  const query = words.join(" ").trim();

  if (query) {
    return query;
  }

  return detectedBrand || "";
}

export function parseProductSearch(
  message = "",
  catalogueTerms = {}
) {
  const text = message.trim();

  const priceFilters =
    detectPriceFilters(text);

  const brand = detectLiveBrand(
    text,
    catalogueTerms
  );

  const productName = detectProductName(
    text,
    catalogueTerms
  );

  const query = buildSearchQuery(
    text,
    brand,
    productName
  );

  return {
    brand,
    productName,
    query,
    minPrice: priceFilters.minPrice,
    maxPrice: priceFilters.maxPrice,
  };
}