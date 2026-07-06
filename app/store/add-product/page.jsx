'use client'

import { assets } from "@/assets/assets";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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
  });

  const [loading, setLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const { getToken } = useAuth();

  const selectedCategory = categories.find(
    (category) => category.id === productInfo.categoryId
  );

  const selectedSubcategory = selectedCategory?.subcategories?.find(
    (sub) => sub.id === productInfo.subcategoryId
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
      });

      setImages({ 1: null, 2: null, 3: null, 4: null });
      setAiUsed(false);
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

      <button
        disabled={loading}
        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-60"
      >
        Add Product
      </button>
    </form>
  );
}