'use client'

import { assets } from "@/assets/assets";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getSpecFields } from "@/lib/productSpecifications";

export default function StoreAddProduct() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });

  const [productInfo, setProductInfo] = useState({
  name: "",
  description: "",
  mrp: 0,
  price: 0,
  category: "",
  categoryId: "",
  subcategoryId: "",
  childCategoryId: "",
  stock: 0,
  lowStockAt: 5,

  specifications: {
    brand: "",
    model: "",
    display: "",
    ram: "",
    storage: "",
    processor: "",
    camera: "",
    battery: "",
    os: "",
    connectivity: "",
    warranty: "",
  },
});

  const [loading, setLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [variants, setVariants] = useState([]);

  const { getToken } = useAuth();

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
    try {
      const { data } = await axios.get("/api/categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
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

  const handleImageUpload = async (key, file) => {
    setImages((prev) => ({ ...prev, [key]: file }));

    if (key === "1" && file && !aiUsed) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        if (!reader.result) {
          toast.error("Failed to read image");
          return;
        }

        const base64String = reader.result.split(",")[1];
        const mimeType = file.type;
        const token = await getToken();

        try {
          await toast.promise(
            axios.post(
              "/api/store/ai",
              { base64Image: base64String, mimeType },
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            {
              loading: "Analyzing image with AI...",
              success: (res) => {
                const data = res.data;

                if (data.name && data.description) {
                  setProductInfo((prev) => ({
                    ...prev,
                    name: data.name,
                    description: data.description,
                  }));

                  setAiUsed(true);
                  return "AI filled product info";
                }

                return "AI could not analyze the image";
              },
              error: (err) => err?.response?.data?.error || err.message,
            }
          );
        } catch (error) {
          console.error(error);
        }
      };
    }
  };

  const addVariant = () => {
  setVariants([
    ...variants,
    {
      name: "",
      value: "",
      price: "",
      stock: "",
      image: [],
    },
  ]);
};

const updateVariant = (index, field, value) => {
  const updated = [...variants];
  updated[index][field] = value;
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

 const onSubmitHandler = async (e) => {
  e.preventDefault();

  try {
    if (!images[1] && !images[2] && !images[3] && !images[4]) {
      return toast.error("Please upload at least one image");
    }

    if (!productInfo.categoryId) {
      return toast.error("Please select a category");
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("name", productInfo.name);
    formData.append("description", productInfo.description);
    formData.append("mrp", productInfo.mrp);
    formData.append("price", productInfo.price);
    formData.append("category", productInfo.category);
    formData.append("categoryId", productInfo.categoryId);
    formData.append("subcategoryId", productInfo.subcategoryId);
    formData.append("childCategoryId", productInfo.childCategoryId);
    formData.append("stock", productInfo.stock);
    formData.append("lowStockAt", productInfo.lowStockAt);

const variantsForUpload = variants.map((variant, index) => ({
  name: variant.name,
  value: variant.value,
  price: variant.price,
  stock: variant.stock,
  imageKeys:
    variant.images?.length > 0
      ? variant.images.map((_, imageIndex) => `variantImage_${index}_${imageIndex}`)
      : [],
}));

formData.append("variants", JSON.stringify(variantsForUpload));

variants.forEach((variant, index) => {
  if (variant.images?.length > 0) {
    variant.images.forEach((image, imageIndex) => {
      formData.append(`variantImage_${index}_${imageIndex}`, image);
    });
  }
});

formData.append(
  "specifications",
  JSON.stringify(productInfo.specifications || {})
);
    formData.append(
      "specifications",
      JSON.stringify(productInfo.specifications || {})
    );

    Object.keys(images).forEach((key) => {
      if (images[key]) {
        formData.append("images", images[key]);
      }
    });

    const token = await getToken();

    const { data } = await axios.post("/api/store/product", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(data.message);

    setProductInfo({
      name: "",
      description: "",
      mrp: 0,
      price: 0,
      category: "",
      categoryId: "",
      subcategoryId: "",
      childCategoryId: "",
      stock: 0,
      lowStockAt: 5,

      specifications: {
        brand: "",
        model: "",
        display: "",
        ram: "",
        storage: "",
        processor: "",
        camera: "",
        battery: "",
        os: "",
        connectivity: "",
        warranty: "",
      },
    });

    setImages({ 1: null, 2: null, 3: null, 4: null });
    setAiUsed(false);
    setVariants([]);
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <form
      onSubmit={(e) =>
        toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })
      }
      className="text-slate-500 mb-28"
    >
      <h1 className="text-2xl">
        Add New <span className="text-slate-800 font-medium">Product</span>
      </h1>

      <p className="mt-7">Product Images</p>

      <div className="flex gap-3 mt-4">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image
              width={300}
              height={300}
              className="h-15 w-auto border border-slate-200 rounded cursor-pointer"
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.upload_area
              }
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              id={`images${key}`}
              onChange={(e) => handleImageUpload(key, e.target.files[0])}
              hidden
            />
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-2 my-6">
        Name
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Enter product name"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
          required
        />
      </label>

      <label className="flex flex-col gap-2 my-6">
        Description
        <textarea
          name="description"
          onChange={onChangeHandler}
          value={productInfo.description}
          placeholder="Enter product description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none"
          required
        />
      </label>

      <div className="flex flex-wrap gap-5">
        <label className="flex flex-col gap-2">
          Actual Price
          <input
            type="number"
            name="mrp"
            onChange={onChangeHandler}
            value={productInfo.mrp}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          Offer Price
          <input
            type="number"
            name="price"
            onChange={onChangeHandler}
            value={productInfo.price}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-5 mt-6">
        <label className="flex flex-col gap-2">
          Stock Quantity
          <input
            type="number"
            name="stock"
            min="0"
            onChange={onChangeHandler}
            value={productInfo.stock}
            placeholder="0"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          Low Stock Alert
          <input
            type="number"
            name="lowStockAt"
            min="1"
            onChange={onChangeHandler}
            value={productInfo.lowStockAt}
            placeholder="5"
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded"
            required
          />
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-5 my-6 max-w-4xl">
        <label className="flex flex-col gap-2">
          Category
          <select
            value={productInfo.categoryId}
            onChange={handleCategoryChange}
            className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
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
            className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
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
            className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
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

      {/* Product Variants */}
      <div className="mt-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-slate-800 font-medium">
            Product Variants
          </h2>

          <button
            type="button"
            onClick={addVariant}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Variant
          </button>
        </div>

        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              
              <div
  key={index}
  className="grid md:grid-cols-6 gap-3 border border-slate-200 rounded-xl p-4 items-center"
>
  {/* Variant Image */}
  <label className="h-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden">
  {variant.images?.length > 0 ? (
  <img
    src={URL.createObjectURL(variant.images[0])}
    alt="Variant"
    className="w-full h-full object-contain p-1"
  />
) : (
  <span className="text-xs text-slate-400">Images</span>
)}

   <input
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={(e) =>
    updateVariant(index, "images", Array.from(e.target.files))
  }
/>
  </label>

  {/* Variant Name */}
  <input
    type="text"
    placeholder="Name (e.g. Color)"
    value={variant.name}
    onChange={(e) =>
      updateVariant(index, "name", e.target.value)
    }
    className="p-2 px-4 border border-slate-200 rounded outline-none"
  />

  {/* Variant Value */}
  <input
    type="text"
    placeholder="Value (e.g. Black)"
    value={variant.value}
    onChange={(e) =>
      updateVariant(index, "value", e.target.value)
    }
    className="p-2 px-4 border border-slate-200 rounded outline-none"
  />

  {/* Extra Price */}
  <input
    type="number"
    placeholder="Extra Price"
    value={variant.price}
    onChange={(e) =>
      updateVariant(index, "price", e.target.value)
    }
    className="p-2 px-4 border border-slate-200 rounded outline-none"
  />

  {/* Stock */}
  <input
    type="number"
    placeholder="Stock"
    value={variant.stock}
    onChange={(e) =>
      updateVariant(index, "stock", e.target.value)
    }
    className="p-2 px-4 border border-slate-200 rounded outline-none"
  />

  {/* Remove Button */}
  <button
    type="button"
    onClick={() => removeVariant(index)}
    className="bg-red-100 text-red-600 rounded hover:bg-red-200 py-2"
  >
    Remove
  </button>
</div>

            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No variants added yet.
          </p>
        )}
     
             </div>

      {/* Technical Specifications */}
      <div className="mt-8 max-w-4xl bg-white border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 via-white to-sky-50 px-6 py-5 border-b border-blue-100">
          <h2 className="text-xl text-slate-900 font-bold">
            Technical Specifications
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Add device details for product comparison and customer information.
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
        disabled={loading}
        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-60"
      >
        Add Product
      </button>

    </form>
  );
}