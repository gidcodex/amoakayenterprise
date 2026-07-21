import prisma from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
    },

    include: {
      subcategories: {
        where: {
          isActive: true,
        },

        include: {
          childCategories: {
            where: {
              isActive: true,
            },

            orderBy: {
              name: "asc",
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      },
    },

    orderBy: {
      name: "asc",
    },
  });
}