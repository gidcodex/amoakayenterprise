import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add a new product
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const category = formData.get("category");

    const categoryId = formData.get("categoryId") || null;
    const subcategoryId = formData.get("subcategoryId") || null;
    const childCategoryId = formData.get("childCategoryId") || null;

    const stock = Number(formData.get("stock"));
    const lowStockAt = Number(formData.get("lowStockAt"));
    const images = formData.getAll("images");
    const specificationsRaw = formData.get("specifications");

    let specifications = {};

     try {
     specifications = specificationsRaw ? JSON.parse(specificationsRaw) : {};
     } catch {
      specifications = {};
     }


    const variantsRaw = formData.get("variants");

     let variants = [];

     try {
     variants = variantsRaw ? JSON.parse(variantsRaw) : [];
     } catch {
     variants = [];
     }

    if (
      !name ||
      !description ||
      !mrp ||
      !price ||
      !category ||
      !categoryId ||
      Number.isNaN(stock) ||
      Number.isNaN(lowStockAt) ||
      images.length < 1
    ) {
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        return imagekit.url({
          path: response.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
      })
    );

  const variantsWithImages = await Promise.all(
  variants.map(async (variant) => {
    const variantImageUrls = [];

    if (variant.imageKeys?.length > 0) {
      for (const imageKey of variant.imageKeys) {
        const variantImage = formData.get(imageKey);

        if (variantImage) {
          const buffer = Buffer.from(await variantImage.arrayBuffer());

          const response = await imagekit.upload({
            file: buffer,
            fileName: variantImage.name,
            folder: "products/variants",
          });

          const imageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1024" },
            ],
          });

          variantImageUrls.push(imageUrl);
        }
      }
    }

    return {
      ...variant,
      image: variantImageUrls[0] || null,
      images: variantImageUrls,
    };
  })
);

   await prisma.product.create({
  data: {
    name,
    description,
    mrp,
    price,
    category,
    categoryId,
    subcategoryId,
    childCategoryId,
    specifications,
    images: imagesUrl,
    stock,
    lowStockAt,
    inStock: stock > 0,
    storeId,

    variants: {
    create: variantsWithImages
    .filter((variant) => variant.name && variant.value)
    .map((variant) => ({
      name: variant.name,
      value: variant.value,
      price: variant.price ? Number(variant.price) : null,
      stock: variant.stock ? Number(variant.stock) : 0,
      image: variant.image || null,
      images: variant.images || [],
    })),
},
  },
});

    return NextResponse.json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// Get all products for a seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        categoryRef: true,
        subcategoryRef: true,
        childCategory: true,
        variants: true,
      },

      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}