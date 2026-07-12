"use client";

import Loading from "@/components/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSpecFields } from "@/lib/productSpecifications";

export default function EditProductPage() {
  const { productId } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [productInfo, setProductInfo] = useState({
  name: "", description: "", mrp: "", price: "", category: "", categoryId: "", subcategoryId: "", childCategoryId: "", stock: "", lowStockAt: "", inStock: true,

  specifications: { brand: "",  model: "", display: "", ram: "", storage: "", processor: "", camera: "", battery: "", os: "", connectivity: "", warranty: "",
  },
});

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const selectedCategory = categories.find(
    (category) => category.id === productInfo.categoryId
  );

  const selectedSubcategory = selectedCategory?.subcategories?.find(
    (sub) => sub.id === productInfo.subcategoryId
  );

  const selectedChildCategory = selectedSubcategory?.childCategories?.find(
  (child) => child.id === productInfo.childCategoryId
);

const specFields = getSpecFields(
  selectedCategory?.name,
  selectedSubcategory?.name,
  selectedChildCategory?.name
);

  const fetchCategories = async () => {
    const { data } = await axios.get("/api/categories");
    setCategories(data.categories || []);
  };

  const fetchProduct = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(`/api/store/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const product = data.product;

      setProductInfo({
       name: product.name || "",
       description: product.description || "",
       mrp: product.mrp || "",
       price: product.price || "",
       category: product.category || "",
       categoryId: product.categoryId || "",
       subcategoryId: product.subcategoryId || "",
       childCategoryId: product.childCategoryId || "",
       stock: product.stock ?? 0,
       lowStockAt: product.lowStockAt ?? 5,
       inStock: product.inStock,

      specifications: {
       brand: product.specifications?.brand || "",
       model: product.specifications?.model || "",
       display: product.specifications?.display || "",
       ram: product.specifications?.ram || "",
       storage: product.specifications?.storage || "",
       processor: product.specifications?.processor || "",
       camera: product.specifications?.camera || "",
       battery: product.specifications?.battery || "",
       os: product.specifications?.os || "",
       connectivity: product.specifications?.connectivity || "",
       warranty: product.specifications?.warranty || "",
  },
});

      setImages(product.images || []);
      setVariants(
      (product.variants || []).map((variant) => ({
      ...variant,
      images: variant.images?.length > 0 ? variant.images : variant.image ? [variant.image] : [],
      newImages: [],
  }))
);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find((item) => item.id === categoryId);

    setProductInfo({
      ...productInfo,
      categoryId,
      category: category?.name || "",
      subcategoryId: "",
      childCategoryId: "",
    });
  };

  const handleSubcategoryChange = (e) => {
    setProductInfo({
      ...productInfo,
      subcategoryId: e.target.value,
      childCategoryId: "",
    });
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        value: "",
        price: "",
        stock: "",
        images: [],
        newImages: [],
      },
    ]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };
  const handleVariantImages = (index, files) => {
  const updated = [...variants];

  updated[index].newImages = [
    ...(updated[index].newImages || []),
    ...Array.from(files),
  ];

  setVariants(updated);
};

const removeVariantExistingImage = (variantIndex, imageIndex) => {
  const updated = [...variants];
  updated[variantIndex].images = updated[variantIndex].images.filter(
    (_, i) => i !== imageIndex
  );
  setVariants(updated);
};

const removeVariantNewImage = (variantIndex, imageIndex) => {
  const updated = [...variants];
  updated[variantIndex].newImages = updated[variantIndex].newImages.filter(
    (_, i) => i !== imageIndex
  );
  setVariants(updated);
};

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (field, value) => {
  setProductInfo((prev) => ({
    ...prev,
    specifications: {
      ...prev.specifications,
      [field]: value,
    },
  }));
};

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImageLeft = (index) => {
  if (index === 0) return;

  const updated = [...images];
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
  setImages(updated);
};

const moveImageRight = (index) => {
  if (index === images.length - 1) return;

  const updated = [...images];
  [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
  setImages(updated);
};


  const handleNewImages = (files) => {
  setNewImages([...newImages, ...Array.from(files)]);
  };

const updateProduct = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    const token = await getToken();

    // Upload new main product images
    const uploadedNewImages = [];

    for (const image of newImages) {
      const formData = new FormData();
      formData.append("image", image);

      const { data } = await axios.post(
        "/api/store/product-upload",
        formData
      );

      uploadedNewImages.push(data.imageUrl);
    }

    const finalImages = [...images, ...uploadedNewImages];

    // Upload new variant images
    const finalVariants = [];

    for (const variant of variants) {
      const uploadedVariantImages = [];

      if (variant.newImages?.length > 0) {
        for (const image of variant.newImages) {
          const formData = new FormData();
          formData.append("image", image);

          const { data } = await axios.post(
            "/api/store/product-upload",
            formData
          );

          uploadedVariantImages.push(data.imageUrl);
        }
      }

      const finalVariantImages = [
        ...(variant.images || []),
        ...uploadedVariantImages,
      ];

      finalVariants.push({
        id: variant.id,
        name: variant.name,
        value: variant.value,
        price: variant.price,
        stock: variant.stock,
        image: finalVariantImages[0] || null,
        images: finalVariantImages,
      });
    }

    const { data } = await axios.patch(
      `/api/store/product/${productId}`,
      {
        ...productInfo,
        images: finalImages,
        variants: finalVariants,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success(data.message);
    setNewImages([]);
    router.push("/store/manage-product");
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  } finally {
    setSaving(false);
  }
};

  if (loading) return <Loading />;

  return (
    <form onSubmit={updateProduct} className="text-slate-500 pb-28">
      <h1 className="text-2xl mb-8">
        Edit <span className="text-slate-800 font-medium">Product</span>
      </h1>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6 max-w-5xl">
  <h2 className="text-xl font-bold text-slate-900 mb-5">
    Product Images
  </h2>

  <div className="flex flex-wrap gap-4">
    {images.length > 0 &&
      images.map((image, index) => (
        <div
          key={index}
          className="relative w-24 h-24 rounded-xl border bg-slate-50"
        >
          <Image
            src={image}
            alt="Product"
            fill
            className="object-contain p-2"
          />

          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
          >
            <Trash2 size={13} />
          </button>

         {/* ADD THIS HERE */}
      <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1">
        <button
          type="button"
          onClick={() => moveImageLeft(index)}
          disabled={index === 0}
          className="bg-white/90 text-slate-700 text-xs px-2 py-1 rounded disabled:opacity-30"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => moveImageRight(index)}
          disabled={index === images.length - 1}
          className="bg-white/90 text-slate-700 text-xs px-2 py-1 rounded disabled:opacity-30"
        >
          →
        </button>
      </div>
      {/* END */}

        </div>
      ))}

    {newImages.length > 0 &&
      newImages.map((image, index) => (
        <div
          key={index}
          className="relative w-24 h-24 rounded-xl border bg-blue-50"
        >
          <img
            src={URL.createObjectURL(image)}
            alt="New product"
            className="w-full h-full object-contain p-2"
          />

          <button
            type="button"
            onClick={() =>
              setNewImages(newImages.filter((_, i) => i !== index))
            }
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}

    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100">
      <Plus size={22} />
      <span className="text-xs mt-1">Add Image</span>

      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleNewImages(e.target.files)}
      />
    </label>
  </div>

  <p className="text-xs text-slate-400 mt-4">
    Existing images are saved already. New images will upload when you click Save Changes.
  </p>
</div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6 max-w-5xl mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Product Information
        </h2>

        <label className="flex flex-col gap-2 my-4">
          Name
          <input
            name="name"
            value={productInfo.name}
            onChange={onChangeHandler}
            className="w-full max-w-xl p-3 border border-slate-200 rounded-lg outline-none"
            required
          />
        </label>

        <label className="flex flex-col gap-2 my-4">
          Description
          <textarea
            name="description"
            value={productInfo.description}
            onChange={onChangeHandler}
            rows={5}
            className="w-full max-w-xl p-3 border border-slate-200 rounded-lg outline-none resize-none"
            required
          />
        </label>

        <div className="grid md:grid-cols-2 gap-5 max-w-xl">
          <label className="flex flex-col gap-2">
            MRP
            <input
              type="number"
              name="mrp"
              value={productInfo.mrp}
              onChange={onChangeHandler}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            Price
            <input
              type="number"
              name="price"
              value={productInfo.price}
              onChange={onChangeHandler}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              required
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-xl mt-5">
          <label className="flex flex-col gap-2">
            Stock
            <input
              type="number"
              name="stock"
              value={productInfo.stock}
              onChange={onChangeHandler}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            Low Stock Alert
            <input
              type="number"
              name="lowStockAt"
              value={productInfo.lowStockAt}
              onChange={onChangeHandler}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              required
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6 max-w-5xl mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Categories
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          <label className="flex flex-col gap-2">
            Category
            <select
              value={productInfo.categoryId}
              onChange={handleCategoryChange}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            Subcategory
            <select
              value={productInfo.subcategoryId}
              onChange={handleSubcategoryChange}
              className="p-3 border border-slate-200 rounded-lg outline-none"
              disabled={!productInfo.categoryId}
            >
              <option value="">Select subcategory</option>
              {selectedCategory?.subcategories?.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            Child Category
            <select
              value={productInfo.childCategoryId}
              onChange={(e) =>
                setProductInfo({
                  ...productInfo,
                  childCategoryId: e.target.value,
                })
              }
              className="p-3 border border-slate-200 rounded-lg outline-none"
              disabled={!productInfo.subcategoryId}
            >
              <option value="">Select child category</option>
              {selectedSubcategory?.childCategories?.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6 max-w-5xl mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Variants
          </h2>

          <button
            type="button"
            onClick={addVariant}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              
          <div
  key={variant.id || index}
  className="border border-slate-200 rounded-xl p-4"
>
  <div className="grid md:grid-cols-5 gap-3">
    <input
      placeholder="Name e.g. Color"
      value={variant.name}
      onChange={(e) => updateVariant(index, "name", e.target.value)}
      className="p-3 border border-slate-200 rounded-lg outline-none"
    />

    <input
      placeholder="Value e.g. Blue"
      value={variant.value}
      onChange={(e) => updateVariant(index, "value", e.target.value)}
      className="p-3 border border-slate-200 rounded-lg outline-none"
    />

    <input
      type="number"
      placeholder="Price"
      value={variant.price || ""}
      onChange={(e) => updateVariant(index, "price", e.target.value)}
      className="p-3 border border-slate-200 rounded-lg outline-none"
    />

    <input
      type="number"
      placeholder="Stock"
      value={variant.stock || ""}
      onChange={(e) => updateVariant(index, "stock", e.target.value)}
      className="p-3 border border-slate-200 rounded-lg outline-none"
    />

    <button
      type="button"
      onClick={() => removeVariant(index)}
      className="bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
    >
      Remove
    </button>
  </div>

  <div className="mt-4">
    <p className="text-sm font-semibold text-slate-700 mb-3">
      Variant Images
    </p>

    <div className="flex flex-wrap gap-3">
      {variant.images?.map((image, imageIndex) => (
        <div
          key={imageIndex}
          className="relative w-20 h-20 rounded-xl border bg-slate-50 overflow-hidden"
        >
          <Image
            src={image}
            alt="Variant"
            fill
            className="object-contain p-2"
          />

          <button
            type="button"
            onClick={() => removeVariantExistingImage(index, imageIndex)}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {variant.newImages?.map((image, imageIndex) => (
        <div
          key={imageIndex}
          className="relative w-20 h-20 rounded-xl border bg-blue-50 overflow-hidden"
        >
          <img
            src={URL.createObjectURL(image)}
            alt="New variant"
            className="w-full h-full object-contain p-2"
          />

          <button
            type="button"
            onClick={() => removeVariantNewImage(index, imageIndex)}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100">
        <Plus size={18} />
        <span className="text-[10px] mt-1">Add</span>

        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleVariantImages(index, e.target.files)}
        />
      </label>
    </div>
  </div>
</div>

            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No variants added.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 max-w-5xl mt-6 overflow-hidden">
  <div className="bg-gradient-to-r from-blue-50 via-white to-sky-50 px-6 py-5 border-b border-blue-100">
    <h2 className="text-xl font-bold text-slate-900">
      Technical Specifications
    </h2>
    <p className="text-sm text-slate-400 mt-1">
      Edit device details used for product comparison and customer information.
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-5 p-6">
    {specFields.map(([field, label, placeholder]) => (
      <label key={field} className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <input
          type="text"
          value={productInfo.specifications?.[field] || ""}
          onChange={(e) => handleSpecificationChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 px-4 outline-none border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
        />
      </label>
    ))}
  </div>
</div>

      <button
        disabled={saving}
        className="mt-8 bg-slate-800 hover:bg-black text-white px-7 py-3 rounded-lg disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}