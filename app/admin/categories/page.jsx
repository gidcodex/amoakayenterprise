"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import {
  FolderTree,
  Plus,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(false);

  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryImage, setSubcategoryImage] = useState(null);
  const [uploadingSubcategory, setUploadingSubcategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [openCategoryId, setOpenCategoryId] = useState(null);

  const [childCategoryName, setChildCategoryName] = useState("");
  const [childCategoryImage, setChildCategoryImage] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [uploadingChildCategory, setUploadingChildCategory] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/admin/categories");
      setCategories(data.categories);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageFile) => {
    if (!imageFile) return "";

    const formData = new FormData();
    formData.append("image", imageFile);

    const { data } = await axios.post("/api/admin/category-upload", formData);

    return data.imageUrl;
  };

  const createCategory = async (e) => {
    e.preventDefault();

    try {
      setUploadingCategory(true);

      const imageUrl = await uploadImage(categoryImage);

      const { data } = await axios.post("/api/admin/categories", {
        name: categoryName,
        image: imageUrl,
      });

      toast.success(data.message);
      setCategoryName("");
      setCategoryImage(null);
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setUploadingCategory(false);
    }
  };

  const createSubcategory = async (e) => {
    e.preventDefault();

    try {
      setUploadingSubcategory(true);

      const imageUrl = await uploadImage(subcategoryImage);

      const { data } = await axios.post("/api/admin/subcategories", {
        name: subcategoryName,
        image: imageUrl,
        categoryId: selectedCategoryId,
      });

      toast.success(data.message);
      setSubcategoryName("");
      setSubcategoryImage(null);
      setSelectedCategoryId("");
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setUploadingSubcategory(false);
    }
  };
  const createChildCategory = async (e) => {
  e.preventDefault();

  try {
    setUploadingChildCategory(true);

    const imageUrl = await uploadImage(childCategoryImage);

    const { data } = await axios.post("/api/admin/child-categories", {
      name: childCategoryName,
      image: imageUrl,
      subcategoryId: selectedSubcategoryId,
    });

    toast.success(data.message);
    setChildCategoryName("");
    setChildCategoryImage(null);
    setSelectedSubcategoryId("");
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  } finally {
    setUploadingChildCategory(false);
  }
};

     const updateCategory = async (category) => {
  const newName = prompt("Enter new category name:", category.name);
  if (!newName) return;

  try {
    const { data } = await axios.patch(`/api/admin/categories/${category.id}`, {
      name: newName,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const deleteCategory = async (categoryId) => {
  if (!confirm("Delete this category and all its subcategories?")) return;

  try {
    const { data } = await axios.delete(`/api/admin/categories/${categoryId}`);
    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const toggleCategory = async (category) => {
  try {
    const { data } = await axios.patch(`/api/admin/categories/${category.id}`, {
      isActive: !category.isActive,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const updateSubcategory = async (sub) => {
  const newName = prompt("Enter new subcategory name:", sub.name);
  if (!newName) return;

  try {
    const { data } = await axios.patch(`/api/admin/subcategories/${sub.id}`, {
      name: newName,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const deleteSubcategory = async (subId) => {
  if (!confirm("Delete this subcategory?")) return;

  try {
    const { data } = await axios.delete(`/api/admin/subcategories/${subId}`);
    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const toggleSubcategory = async (sub) => {
  try {
    const { data } = await axios.patch(`/api/admin/subcategories/${sub.id}`, {
      isActive: !sub.isActive,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
}; 


const updateChildCategory = async (child) => {
  const newName = prompt("Enter new child category name:", child.name);
  if (!newName) return;

  try {
    const { data } = await axios.patch(`/api/admin/child-categories/${child.id}`, {
      name: newName,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const deleteChildCategory = async (childId) => {
  if (!confirm("Delete this child category?")) return;

  try {
    const { data } = await axios.delete(`/api/admin/child-categories/${childId}`);
    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};

const toggleChildCategory = async (child) => {
  try {
    const { data } = await axios.patch(`/api/admin/child-categories/${child.id}`, {
      isActive: !child.isActive,
    });

    toast.success(data.message);
    fetchCategories();
  } catch (error) {
    toast.error(error?.response?.data?.error || error.message);
  }
};


  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 pb-12">
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">ADMIN CENTER</p>

        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Category Management
        </h1>

        <p className="text-slate-500 mt-2">
          Create marketplace categories and subcategories for the frontend
          navigation.
        </p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        <form
          onSubmit={createCategory}
          className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
            <FolderTree size={21} />
            Add Category
          </h2>

          <label className="flex flex-col gap-2 text-sm">
            Category Name
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Electronics"
              className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm mt-4">
            Category Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImage(e.target.files[0])}
              className="border border-slate-200 rounded-lg px-4 py-3"
            />

            {categoryImage && (
              <img
                src={URL.createObjectURL(categoryImage)}
                className="w-24 h-24 rounded-lg object-cover border"
                alt="Category preview"
              />
            )}
          </label>

          <button
            disabled={uploadingCategory}
            className="mt-5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {uploadingCategory ? "Uploading..." : "Create Category"}
          </button>
        </form>

        <form
          onSubmit={createSubcategory}
          className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
            <ImageIcon size={21} />
            Add Subcategory
          </h2>

          <label className="flex flex-col gap-2 text-sm">
            Select Category
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              required
            >
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm mt-4">
            Subcategory Name
            <input
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              placeholder="Phones"
              className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm mt-4">
            Subcategory Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSubcategoryImage(e.target.files[0])}
              className="border border-slate-200 rounded-lg px-4 py-3"
            />

            {subcategoryImage && (
              <img
                src={URL.createObjectURL(subcategoryImage)}
                className="w-24 h-24 rounded-lg object-cover border"
                alt="Subcategory preview"
              />
            )}
          </label>

          <button
            disabled={uploadingSubcategory}
            className="mt-5 bg-slate-800 hover:bg-black disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {uploadingSubcategory ? "Uploading..." : "Create Subcategory"}
          </button>
        </form>
        
        <form
          onSubmit={createChildCategory}
          className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 p-6"
        >
       <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
       <ImageIcon size={21} />
         Add Child Category
       </h2>

     <label className="flex flex-col gap-2 text-sm">
      Select Subcategory
      <select
      value={selectedSubcategoryId}
      onChange={(e) => setSelectedSubcategoryId(e.target.value)}
      className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
      required
      >
      <option value="">Choose subcategory</option>
      {categories.map((category) =>
        category.subcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {category.name} / {sub.name}
          </option>
        ))
      )}
    </select>
  </label>

  <label className="flex flex-col gap-2 text-sm mt-4">
    Child Category Name
    <input
      value={childCategoryName}
      onChange={(e) => setChildCategoryName(e.target.value)}
      placeholder="Android Phones"
      className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-4 focus:ring-green-100"
      required
    />
  </label>

  <label className="flex flex-col gap-2 text-sm mt-4">
    Child Category Image
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setChildCategoryImage(e.target.files[0])}
      className="border border-slate-200 rounded-lg px-4 py-3"
    />

    {childCategoryImage && (
      <img
        src={URL.createObjectURL(childCategoryImage)}
        className="w-24 h-24 rounded-lg object-cover border"
        alt="Child category preview"
      />
    )}
  </label>

  <button
    disabled={uploadingChildCategory}
    className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
  >
    <Plus size={18} />
    {uploadingChildCategory ? "Uploading..." : "Create Child Category"}
  </button>
</form>

      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden max-w-7xl">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
        </div>

          {categories.length > 0 ? (
  <div className="divide-y divide-slate-100">
    {categories.map((category) => {
      const isOpen = openCategoryId === category.id;

      return (
        <div key={category.id}>
          <div className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50">
            <button
              onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
              className="flex items-center gap-4 flex-1 text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FolderTree size={20} />
                )}
              </div>

              <div>
                <p className="font-bold text-slate-900">{category.name}</p>
                <p className="text-xs text-slate-400">
                  {category.subcategories.length} subcategories
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCategory(category)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                  category.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {category.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                {category.isActive ? "Active" : "Hidden"}
              </button>

              <button
                onClick={() => updateCategory(category)}
                className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                onClick={() => deleteCategory(category.id)}
                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete
              </button>

              <button
                onClick={() => setOpenCategoryId(isOpen ? null : category.id)}
                className="p-2 text-slate-500"
              >
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="px-6 pb-5">
              <div className="grid lg:grid-cols-2 gap-5">
                {category.subcategories.length > 0 ? (
                  category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-start justify-between gap-3"
                    >
    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                          {sub.image ? (
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
  <p className="font-semibold text-slate-900 truncate">
    {sub.name}
  </p>

  <p className="text-xs text-slate-400 truncate">
    {sub.slug}
  </p>

  
  {sub.childCategories?.length > 0 && (
  <div className="mt-3 space-y-2">
    {sub.childCategories.map((child) => (
      <div
        key={child.id}
        className="bg-white border border-blue-100 rounded-xl p-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
            {child.image ? (
              <img
                src={child.image}
                alt={child.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={14} className="text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {child.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {child.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => toggleChildCategory(child)}
            className={`p-1.5 rounded-md ${
              child.isActive
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {child.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>

          <button
            onClick={() => updateChildCategory(child)}
            className="p-1.5 rounded-md bg-blue-100 text-blue-700"
          >
            <Pencil size={12} />
          </button>

          <button
            onClick={() => deleteChildCategory(child.id)}
            className="p-1.5 rounded-md bg-red-100 text-red-700"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    ))}
  </div>
)}

       </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleSubcategory(sub)}
                          className={`p-2 rounded-lg ${
                            sub.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {sub.isActive ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>

                        <button
                          onClick={() => updateSubcategory(sub)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-700"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => deleteSubcategory(sub.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No subcategories yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
  <div className="p-12 text-center text-slate-400">
    No categories created yet.
  </div>
)}
     

      </div>
    </div>
  );
}