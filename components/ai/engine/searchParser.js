const BRANDS = [
  "Samsung",
  "Apple",
  "Xiaomi",
  "Redmi",
  "Motorola",
  "Google",
  "OnePlus",
  "Tecno",
  "Infinix",
  "Nokia",
  "Huawei",
  "Honor",
  "Oppo",
  "Realme",
  "Vivo",
];

function detectBrand(text) {
  const normalizedText = text.toLowerCase();

  return (
    BRANDS.find((brand) =>
      normalizedText.includes(brand.toLowerCase())
    ) || null
  );
}

function detectPriceFilters(text) {
  const maxPriceMatch =
    text.match(
      /(?:under|below|less than|maximum|max)\s*(?:ghs|₵|€|\$|£)?\s*([\d,.]+)/i
    ) ||
    text.match(
      /(?:ghs|₵|€|\$|£)\s*([\d,.]+)\s*(?:or less|maximum|max)/i
    );

  const minPriceMatch =
    text.match(
      /(?:above|over|more than|minimum|min)\s*(?:ghs|₵|€|\$|£)?\s*([\d,.]+)/i
    ) ||
    text.match(
      /(?:ghs|₵|€|\$|£)\s*([\d,.]+)\s*(?:or more|minimum|min)/i
    );

  const convertPrice = (match) => {
    if (!match?.[1]) return null;

    const number = Number(
      match[1].replace(/,/g, "")
    );

    return Number.isFinite(number) ? number : null;
  };

  return {
    minPrice: convertPrice(minPriceMatch),
    maxPrice: convertPrice(maxPriceMatch),
  };
}

export function parseProductSearch(message = "") {
  const text = message.trim();

  const priceFilters = detectPriceFilters(text);

  return {
    brand: detectBrand(text),
    minPrice: priceFilters.minPrice,
    maxPrice: priceFilters.maxPrice,
  };
}