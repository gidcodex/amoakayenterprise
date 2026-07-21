function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createSearchTerms(item) {
  if (!item) return [];

  const name = normalizeText(item.name);
  const slug = normalizeText(item.slug);

  const terms = new Set();

  if (name) terms.add(name);
  if (slug) terms.add(slug);

  // Add a simple singular form.
  if (name.endsWith("s") && name.length > 3) {
    terms.add(name.slice(0, -1));
  }

  if (slug.endsWith("s") && slug.length > 3) {
    terms.add(slug.slice(0, -1));
  }

  return Array.from(terms);
}

function messageContainsTerm(message, term) {
  if (!message || !term) return false;

  const normalizedMessage = ` ${normalizeText(message)} `;
  const normalizedTerm = ` ${normalizeText(term)} `;

  return normalizedMessage.includes(normalizedTerm);
}

export function matchCategoryHierarchy(
  message = "",
  categoryTree = []
) {
  const matches = [];

  for (const category of categoryTree) {
    const categoryMatched = createSearchTerms(category).some(
      (term) => messageContainsTerm(message, term)
    );

    if (categoryMatched) {
      matches.push({
        level: "category",
        score: 1,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        subcategory: null,
        childCategory: null,
      });
    }

    for (const subcategory of category.subcategories || []) {
      const subcategoryMatched =
        createSearchTerms(subcategory).some((term) =>
          messageContainsTerm(message, term)
        );

      if (subcategoryMatched) {
        matches.push({
          level: "subcategory",
          score: 2,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          subcategory: {
            id: subcategory.id,
            name: subcategory.name,
            slug: subcategory.slug,
          },
          childCategory: null,
        });
      }

      for (
        const childCategory of
        subcategory.childCategories || []
      ) {
        const childMatched =
          createSearchTerms(childCategory).some((term) =>
            messageContainsTerm(message, term)
          );

        if (childMatched) {
          matches.push({
            level: "child-category",
            score: 3,
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
            subcategory: {
              id: subcategory.id,
              name: subcategory.name,
              slug: subcategory.slug,
            },
            childCategory: {
              id: childCategory.id,
              name: childCategory.name,
              slug: childCategory.slug,
            },
          });
        }
      }
    }
  }

  if (matches.length === 0) {
    return {
      level: null,
      category: null,
      subcategory: null,
      childCategory: null,
    };
  }

  matches.sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    const firstLength =
      first.childCategory?.name?.length ||
      first.subcategory?.name?.length ||
      first.category?.name?.length ||
      0;

    const secondLength =
      second.childCategory?.name?.length ||
      second.subcategory?.name?.length ||
      second.category?.name?.length ||
      0;

    return secondLength - firstLength;
  });

  const bestMatch = matches[0];

  return {
    level: bestMatch.level,
    category: bestMatch.category,
    subcategory: bestMatch.subcategory,
    childCategory: bestMatch.childCategory,
  };
}