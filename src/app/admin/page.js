"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/utils/api";
import {
  LogOut,
  Plus,
  Trash2,
  FileDown,
  Eye,
  EyeOff,
  Pencil,
  MoreVertical,
  Menu,
} from "lucide-react";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("reports");
  const [activeCollectionTab, setActiveCollectionTab] = useState("date");
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterTrigger, setFilterTrigger] = useState(0);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [reports, setReports] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Add Product Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdShortDesc, setNewProdShortDesc] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdSalePrice, setNewProdSalePrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdGender, setNewProdGender] = useState("unisex");
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdBestSelling, setNewProdBestSelling] = useState(false);
  const [newProdNewArrival, setNewProdNewArrival] = useState(false);
  const [newProdNotes, setNewProdNotes] = useState("");
  const [newProdFiles, setNewProdFiles] = useState([]);

  // Edit Product Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editProdId, setEditProdId] = useState(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdShortDesc, setEditProdShortDesc] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdSalePrice, setEditProdSalePrice] = useState("");
  const [editProdStock, setEditProdStock] = useState("10");
  const [editProdCategory, setEditProdCategory] = useState("");
  const [editProdGender, setEditProdGender] = useState("unisex");
  const [editProdFeatured, setEditProdFeatured] = useState(false);
  const [editProdBestSelling, setEditProdBestSelling] = useState(false);
  const [editProdNewArrival, setEditProdNewArrival] = useState(false);
  const [editProdNotes, setEditProdNotes] = useState("");
  const [editProdFiles, setEditProdFiles] = useState([]);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Password Visibility States
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (
      tabParam &&
      ["reports", "products", "orders", "users", "settings"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Admin access check redirect removed so customer sessions can log in as admin from here

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;

    setAdminLoading(true);
    const result = await login(adminEmail, adminPassword);
    setAdminLoading(false);

    if (result.success) {
      if (result.user.role === "admin") {
        toast.success("Admin access granted.");
        router.push("/admin");
      } else {
        toast.error("Only admin accounts may access this page.");
        router.push("/dashboard");
      }
    } else {
      toast.error(result.message);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "reports" || activeTab === "breakdown") {
          let url = "/admin/reports";
          const queryParams = [];
          if (startDate) queryParams.push(`startDate=${startDate}`);
          if (endDate) queryParams.push(`endDate=${endDate}`);
          if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
          }
          const res = await api.get(url);
          setReports(res.data);
        } else if (activeTab === "products") {
          // Fetch products and categories concurrently
          const [prodRes, catRes] = await Promise.all([
            api.get("/products"),
            api.get("/categories"),
          ]);

          setProducts(prodRes.data.products || []);
          setCategories(catRes.data || []);
        } else if (activeTab === "orders") {
          const res = await api.get("/admin/orders");
          setOrders(res.data || []);
        } else if (activeTab === "users") {
          const res = await api.get("/admin/users");
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        toast.error("Failed to load admin module data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user, isAdmin, toast, filterTrigger]);
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your admin email.");
      return;
    }

    try {
      setForgotLoading(true);

      const res = await api.post("/admin/forgot-password", {
        email: forgotEmail,
      });

      toast.success(res.data.message);

      setShowForgotModal(false);
      setShowResetModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setForgotLoading(false);
    }
  };
  const handleResetPassword = async () => {
    if (!forgotOTP || !forgotNewPassword || !forgotConfirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);

      const res = await api.post("/admin/reset-password", {
        email: forgotEmail,
        otp: forgotOTP,
        newPassword: forgotNewPassword,
      });

      toast.success(res.data.message);

      setShowResetModal(false);

      setForgotEmail("");
      setForgotOTP("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both Start Date and End Date.");
      return;
    }
    setIsFilterApplied(true);
    setFilterTrigger((prev) => prev + 1);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setIsFilterApplied(false);
    setFilterTrigger((prev) => prev + 1);
  };

  const dateWiseTotalOrders =
    reports?.dateWise?.reduce((sum, row) => sum + (row.orders_count || 0), 0) ||
    0;
  const dateWiseTotalRevenue =
    reports?.dateWise?.reduce(
      (sum, row) => sum + (parseFloat(row.revenue) || 0),
      0,
    ) || 0;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated.");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleToggleBlock = async (userId, currentRole) => {
    const shouldBlock = currentRole !== "blocked";
    try {
      const response = await api.put(`/admin/users/${userId}/block`, {
        block: shouldBlock,
      });
      toast.success(response.data.message || "User access updated.");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: shouldBlock ? "blocked" : "user" }
            : u,
        ),
      );
    } catch (err) {
      toast.error("Failed to update user access.");
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`))
      return;

    try {
      await api.delete(`/admin/products/${id}`);
      toast.success(`Product "${name}" deleted successfully.`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleOpenEditModal = (prod) => {
    setEditProdId(prod.id);
    setEditProdName(prod.name || "");
    setEditProdShortDesc(prod.short_description || "");
    setEditProdDesc(prod.description || "");
    setEditProdPrice(prod.price || "");
    setEditProdSalePrice(prod.sale_price || "");
    setEditProdStock(
      prod.stock_quantity !== undefined ? String(prod.stock_quantity) : "10",
    );
    setEditProdCategory(prod.category_id || "");
    setEditProdGender((prod.gender || "unisex").toLowerCase());
    setEditProdFeatured(!!prod.is_featured);
    setEditProdBestSelling(!!prod.is_best_selling);
    setEditProdNewArrival(!!prod.is_new_arrival);
    setEditProdNotes(
      Array.isArray(prod.fragrance_notes)
        ? prod.fragrance_notes.join(", ")
        : prod.fragrance_notes || "",
    );
    setEditProdFiles([]);
    setIsEditModalOpen(true);
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editProdName || !editProdDesc || !editProdPrice || !editProdGender) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editProdName);
      formData.append("description", editProdDesc);
      if (editProdShortDesc)
        formData.append("short_description", editProdShortDesc);
      formData.append("price", editProdPrice);
      if (editProdSalePrice) formData.append("sale_price", editProdSalePrice);
      formData.append("stock_quantity", editProdStock || "0");
      if (editProdCategory) formData.append("category_id", editProdCategory);
      formData.append("gender", editProdGender);
      formData.append("is_featured", editProdFeatured);
      formData.append("is_best_selling", editProdBestSelling);
      formData.append("is_new_arrival", editProdNewArrival);

      if (editProdNotes) {
        const notesArray = editProdNotes
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
        formData.append("fragrance_notes", JSON.stringify(notesArray));
      }

      if (editProdFiles && editProdFiles.length > 0) {
        if (editProdFiles.length > 10) {
          toast.error("You can upload a maximum of 10 images per product.");
          setEditLoading(false);
          return;
        }
        for (let i = 0; i < editProdFiles.length; i++) {
          const file = editProdFiles[i];
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`Image "${file.name}" exceeds the 5MB size limit.`);
            setEditLoading(false);
            return;
          }
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ];
          if (!allowedTypes.includes(file.type)) {
            toast.error(`Image "${file.name}" has an unsupported format.`);
            setEditLoading(false);
            return;
          }
          formData.append("images", file);
        }
      }

      await api.put(`/admin/products/${editProdId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
      setIsEditModalOpen(false);

      // Refresh list
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Edit product error:", err);
      toast.error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/invoice/${orderId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_Bhatkar_${orderId}.pdf`;
      link.click();
      toast.success(`Invoice for order #${orderId} downloaded.`);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice.");
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdPrice || !newProdGender) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newProdName);
      formData.append("description", newProdDesc);
      if (newProdShortDesc)
        formData.append("short_description", newProdShortDesc);
      formData.append("price", newProdPrice);
      if (newProdSalePrice) formData.append("sale_price", newProdSalePrice);
      formData.append("stock_quantity", newProdStock || "0");
      if (newProdCategory) formData.append("category_id", newProdCategory);
      formData.append("gender", newProdGender);
      formData.append("is_featured", newProdFeatured);
      formData.append("is_best_selling", newProdBestSelling);
      formData.append("is_new_arrival", newProdNewArrival);

      if (newProdNotes) {
        const notesArray = newProdNotes
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
        formData.append("fragrance_notes", JSON.stringify(notesArray));
      }

      if (newProdFiles && newProdFiles.length > 0) {
        if (newProdFiles.length > 10) {
          toast.error("You can upload a maximum of 10 images per product.");
          setAddLoading(false);
          return;
        }
        for (let i = 0; i < newProdFiles.length; i++) {
          const file = newProdFiles[i];
          // Limit to 5MB (matches Multer configuration on the backend)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`Image "${file.name}" exceeds the 5MB size limit.`);
            setAddLoading(false);
            return;
          }
          // Validate image format
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
          ];
          if (!allowedTypes.includes(file.type)) {
            toast.error(
              `Image "${file.name}" has an unsupported format. Please upload JPG, PNG, or WEBP.`,
            );
            setAddLoading(false);
            return;
          }
          formData.append("images", file);
        }
      }

      await api.post("/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully!");
      setIsAddModalOpen(false);

      // Reset fields
      setNewProdName("");
      setNewProdShortDesc("");
      setNewProdDesc("");
      setNewProdPrice("");
      setNewProdSalePrice("");
      setNewProdStock("10");
      setNewProdCategory("");
      setNewProdGender("unisex");
      setNewProdFeatured(false);
      setNewProdBestSelling(false);
      setNewProdNewArrival(false);
      setNewProdNotes("");
      setNewProdFiles([]);

      // Refresh list
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Add product error:", err);
      toast.error(err.response?.data?.message || "Failed to add product.");
    } finally {
      setAddLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    try {
      await api.put("/user/password", { oldPassword, newPassword });
      toast.success("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const filteredOrders = orders.filter((ord) =>
    ord.id.toString().includes(orderSearchQuery.trim()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] bg-luxury-deep text-luxury-black">
      {!authLoading && (!user || !isAdmin) ? (
        <div className="max-w-lg mx-auto bg-white border border-luxury-lightgrey rounded-sm shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair text-2xl font-bold tracking-wide text-luxury-black uppercase">
              Admin Sign In
            </h1>
            <p className="text-xs text-gray-500 font-light mt-2">
              Sign in with your admin credentials to manage inventory and
              orders.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Admin Email
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-gold"
              placeholder="admin@bhatkar-perfumes.com"
            />
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Password
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-3 rounded-sm focus:outline-none focus:border-gold"
              placeholder="AdminPass123"
            />
            <button
              type="submit"
              disabled={adminLoading}
              className="btn-gold w-full py-3.5 rounded-sm uppercase tracking-widest font-bold text-xs"
            >
              {adminLoading ? "Signing In..." : "Sign In as Admin"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(adminEmail);
                setShowForgotModal(true);
              }}
              className="text-gold hover:underline text-xs text-center mt-3 w-full"
            >
              Forgot Password?
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="pb-6 border-b border-luxury-lightgrey mb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-playfair text-xl sm:text-2xl font-bold tracking-wide text-luxury-black uppercase">
                  Admin Management Console
                </h1>

                {/* Mobile Actions (Hamburger dropdown) */}
                <div className="relative md:hidden shrink-0 mt-0.5">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="bg-white hover:bg-gray-50 text-luxury-black border border-luxury-lightgrey p-1.5 rounded transition-all duration-300 focus:outline-none shadow-sm flex items-center justify-center cursor-pointer"
                    type="button"
                    aria-label="Admin Actions"
                  >
                    <Menu className="w-4 h-4 text-gray-500" />
                  </button>

                  {menuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMenuOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-luxury-lightgrey rounded-sm shadow-lg py-1 z-20">
                        <button
                          onClick={() => {
                            setActiveTab("settings");
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 hover:text-luxury-black hover:bg-luxury-deep transition-colors font-bold cursor-pointer"
                          type="button"
                        >
                          Change Password
                        </button>
                        <hr className="border-luxury-lightgrey my-0.5" />
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                            router.push("/login");
                            toast.success("Logged out successfully.");
                          }}
                          className="w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-red-500 hover:bg-red-50/50 transition-colors font-bold flex items-center gap-2 cursor-pointer"
                          type="button"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 font-light mt-1">
                Manage products, categories, orders and customer access.
              </p>
            </div>
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab("settings")}
                className="bg-white hover:bg-gray-50 text-luxury-black border border-luxury-lightgrey text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md transition-all duration-300 focus:outline-none shadow-sm hover:shadow text-center cursor-pointer"
                type="button"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                  toast.success("Logged out successfully.");
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none shadow-sm hover:shadow cursor-pointer"
                type="button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </div>

          <div className="flex border-b border-luxury-lightgrey text-[10px] uppercase tracking-widest font-bold mb-6 overflow-x-auto no-scrollbar bg-white shadow-sm">
            {[
              { id: "reports", name: "Analytics Reports" },
              { id: "breakdown", name: "Collection Breakdown" },
              { id: "products", name: "Products Grid" },
              { id: "orders", name: "Order Logs" },
              { id: "users", name: "Users / Customers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-6 shrink-0 border-b-2 font-bold transition-all ${activeTab === tab.id ? "border-gold text-gold bg-luxury-deep" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                type="button"
              >
                {tab.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24 text-gold text-xs uppercase tracking-widest font-bold">
              Loading Admin Module...
            </div>
          ) : (
            <div className="bg-white border border-luxury-lightgrey rounded-sm p-6 shadow-sm">
              {activeTab === "reports" && reports && (
                <div className="flex flex-col gap-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-luxury-lightgrey rounded-sm">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">
                        Total Revenue
                      </p>
                      <p className="text-xl font-bold text-luxury-black">
                        ₹
                        {parseFloat(
                          reports.summary?.total_revenue || 0,
                        ).toFixed(0)}
                      </p>
                    </div>
                    <div className="p-4 border border-luxury-lightgrey rounded-sm">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">
                        Total Orders
                      </p>
                      <p className="text-xl font-bold text-luxury-black">
                        {reports.summary?.total_orders || 0}
                      </p>
                    </div>
                    <div className="p-4 border border-luxury-lightgrey rounded-sm">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">
                        Average Order Value
                      </p>
                      <p className="text-xl font-bold text-luxury-black">
                        ₹
                        {parseFloat(
                          reports.summary?.avg_order_value || 0,
                        ).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "breakdown" && reports && (
                <div className="flex flex-col gap-6">
                  {/* Date Range Selector */}
                  <div className="flex flex-col sm:flex-row items-end gap-3 p-4 border border-luxury-lightgrey bg-luxury-deep rounded-sm">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-white border border-luxury-lightgrey text-luxury-black text-xs px-3 py-2 rounded focus:outline-none focus:border-gold w-full sm:w-44"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-white border border-luxury-lightgrey text-luxury-black text-xs px-3 py-2 rounded focus:outline-none focus:border-gold w-full sm:w-44"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={handleApplyFilter}
                        className="bg-gold hover:bg-gold-dark text-white text-[9px] tracking-widest font-bold uppercase px-4 py-2.5 rounded transition-all focus:outline-none flex-1 sm:flex-none shadow-sm"
                        type="button"
                      >
                        Apply Filter
                      </button>
                      <button
                        onClick={handleResetFilter}
                        className="bg-white border border-luxury-lightgrey hover:border-gray-300 text-gray-500 text-[9px] tracking-widest font-bold uppercase px-4 py-2.5 rounded transition-all focus:outline-none flex-1 sm:flex-none"
                        type="button"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {isFilterApplied ? (
                    <div className="mt-4">
                      <div className="flex justify-between items-center pb-3 border-b border-luxury-lightgrey mb-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500">
                          Collection Breakdown
                        </h3>
                      </div>

                      <div className="border border-luxury-lightgrey rounded-sm overflow-hidden shadow-sm">
                        <div className="overflow-x-auto no-scrollbar">
                          <div className="min-w-[500px]">
                            <div className="flex border-b border-luxury-lightgrey bg-luxury-deep text-[9px] uppercase tracking-widest font-bold py-3.5 px-4 text-gray-500">
                              <div className="flex-1">Date</div>
                              <div className="w-32 text-center">
                                Total Orders
                              </div>
                              <div className="w-48 text-right">
                                Total Revenue
                              </div>
                            </div>
                            <div className="divide-y divide-luxury-lightgrey bg-white">
                              {!reports.dateWise ||
                              reports.dateWise.length === 0 ? (
                                <div className="py-8 text-center text-xs text-gray-400">
                                  No date-wise collections recorded.
                                </div>
                              ) : (
                                <>
                                  {reports.dateWise.map((row, idx) => (
                                    <div
                                      key={idx}
                                      className="flex py-3 px-4 text-xs items-center hover:bg-gray-50/50 transition-colors"
                                    >
                                      <div className="flex-1 font-semibold text-luxury-black">
                                        {row.date}
                                      </div>
                                      <div className="w-32 text-center text-gray-500">
                                        {row.orders_count}
                                      </div>
                                      <div className="w-48 text-right font-bold text-gold">
                                        ₹{parseFloat(row.revenue).toFixed(2)}
                                      </div>
                                    </div>
                                  ))}
                                  {/* Total Row */}
                                  <div className="flex py-3.5 px-4 text-xs items-center bg-luxury-deep border-t border-luxury-lightgrey font-bold">
                                    <div className="flex-1 text-luxury-black uppercase tracking-wider font-bold">
                                      Total
                                    </div>
                                    <div className="w-32 text-center text-luxury-black">
                                      {dateWiseTotalOrders}
                                    </div>
                                    <div className="w-48 text-right text-gold font-extrabold">
                                      ₹{dateWiseTotalRevenue.toFixed(2)}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 text-center text-xs text-gray-400 font-light py-12 border border-dashed border-luxury-lightgrey bg-luxury-deep/30 rounded-sm">
                      Please select a date range and click{" "}
                      <span className="font-semibold text-gold">
                        Apply Filter
                      </span>{" "}
                      to generate the Collection Breakdown.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "products" && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                      Listed products
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-gold hover:bg-gold-dark text-white text-[10px] tracking-widest font-semibold uppercase px-4 py-2.5 rounded-md flex items-center gap-1.5 transition-all shadow-sm focus:outline-none"
                      type="button"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Product
                    </button>
                  </div>
                  {products.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No products available yet.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex justify-between items-center border border-luxury-lightgrey rounded-sm p-3"
                        >
                          <div>
                            <p className="font-semibold text-luxury-black text-sm">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                              {prod.category_name || "Uncategorized"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gold">
                              ₹{parseFloat(prod.price || 0).toFixed(0)}
                            </p>
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="text-gray-400 hover:text-gold p-1.5 rounded hover:bg-gold/10 transition-colors focus:outline-none"
                              title="Edit Product"
                              type="button"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProduct(prod.id, prod.name)
                              }
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors focus:outline-none"
                              title="Delete Product"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order ID"
                    className="w-full max-w-xs bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2 rounded-sm focus:outline-none focus:border-gold"
                  />
                  {filteredOrders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders found.</p>
                  ) : (
                    <div className="grid gap-3">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="border border-luxury-lightgrey rounded-sm p-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-luxury-black text-xs sm:text-sm break-all">
                                #{ord.id}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {ord.customer_name}
                              </p>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-luxury-lightgrey">
                              <p className="font-bold text-luxury-black text-sm">
                                ₹{parseFloat(ord.total_amount || 0).toFixed(0)}
                              </p>
                              <div className="flex items-center gap-2">
                                <select
                                  value={ord.status || "Pending"}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(
                                      ord.id,
                                      e.target.value,
                                    )
                                  }
                                  className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-2 py-1.5 rounded bg-white focus:outline-none focus:border-gold"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleDownloadInvoice(ord.id)}
                                  className="p-2 border border-gold/30 hover:border-gold text-gold hover:bg-gold/5 rounded transition-all duration-300 flex items-center justify-center focus:outline-none"
                                  title="Download Invoice"
                                  type="button"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div className="flex flex-col gap-4">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500">No users found.</p>
                  ) : (
                    <div className="grid gap-3">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="flex justify-between items-center border border-luxury-lightgrey rounded-sm p-3"
                        >
                          <div>
                            <p className="font-semibold text-luxury-black">
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                          <button
                            onClick={() => handleToggleBlock(u.id, u.role)}
                            className={`text-[9px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest border ${u.role === "blocked" ? "border-green-500/30 text-green-600 font-semibold" : "border-red-500/30 text-red-500 font-semibold"}`}
                            type="button"
                          >
                            {u.role === "blocked" ? "Unblock" : "Block"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="max-w-md mx-auto py-4">
                  <h3 className="font-playfair text-lg font-bold uppercase tracking-wider text-luxury-black mb-6 pb-2 border-b border-luxury-lightgrey">
                    Change Password
                  </h3>
                  <form
                    onSubmit={handlePasswordChange}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                        Old Password *
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showOldPass ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          className="w-full bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs pl-4 pr-10 py-3 rounded-sm focus:outline-none focus:border-gold"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass(!showOldPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors focus:outline-none"
                        >
                          {showOldPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                        New Password *
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs pl-4 pr-10 py-3 rounded-sm focus:outline-none focus:border-gold"
                          placeholder="New password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors focus:outline-none"
                        >
                          {showNewPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                        Confirm New Password *
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs pl-4 pr-10 py-3 rounded-sm focus:outline-none focus:border-gold"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors focus:outline-none"
                        >
                          {showConfirmPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="btn-gold w-full py-3.5 rounded-sm uppercase tracking-widest font-bold text-xs mt-2"
                    >
                      {passLoading ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Add Product Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-luxury-lightgrey mb-6">
              <h2 className="font-playfair text-sm font-bold uppercase tracking-widest text-luxury-black">
                Add New Luxury Product
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gold text-sm font-bold focus:outline-none"
                type="button"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAddProductSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    required
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. Velvet Musk EDP"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Category *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    required
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. 1999"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Sale Price (INR - Optional)
                  </label>
                  <input
                    type="number"
                    value={newProdSalePrice}
                    onChange={(e) => setNewProdSalePrice(e.target.value)}
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. 1499"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    required
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. 50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Gender *
                  </label>
                  <select
                    value={newProdGender}
                    onChange={(e) => setNewProdGender(e.target.value)}
                    required
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Short Description
                </label>
                <input
                  type="text"
                  value={newProdShortDesc}
                  onChange={(e) => setNewProdShortDesc(e.target.value)}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  placeholder="Brief tagline for product list/quick view"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Detailed Description *
                </label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  required
                  rows={3}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold resize-none"
                  placeholder="Describe the fragrance structure, ingredients, and character..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Fragrance Notes (Comma separated, e.g. Bergamot, Sandalwood,
                  Musk)
                </label>
                <input
                  type="text"
                  value={newProdNotes}
                  onChange={(e) => setNewProdNotes(e.target.value)}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  placeholder="Top, Heart, Base notes"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Product Images (Up to 10 files · JPG, PNG, WEBP · Max 5MB
                  each)
                </label>
                <div
                  className="border border-dashed border-luxury-lightgrey rounded bg-luxury-deep px-3 py-4 text-center cursor-pointer hover:border-gold transition-colors"
                  onClick={() =>
                    document.getElementById("prod-image-upload").click()
                  }
                >
                  <input
                    id="prod-image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setNewProdFiles(e.target.files)}
                    className="hidden"
                  />
                  {newProdFiles && newProdFiles.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-gold font-semibold">
                        {newProdFiles.length} file
                        {newProdFiles.length > 1 ? "s" : ""} selected
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {Array.from(newProdFiles).map((f, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-white border border-luxury-lightgrey text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">
                        Click to change selection
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-[10px] text-gray-400">
                        Click to select images
                      </p>
                      <p className="text-[9px] text-gray-300">
                        Up to 10 images • JPG, PNG, WEBP
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdFeatured}
                    onChange={(e) => setNewProdFeatured(e.target.checked)}
                    className="accent-gold"
                  />
                  Featured
                </label>

                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdBestSelling}
                    onChange={(e) => setNewProdBestSelling(e.target.checked)}
                    className="accent-gold"
                  />
                  Best Seller
                </label>

                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdNewArrival}
                    onChange={(e) => setNewProdNewArrival(e.target.checked)}
                    className="accent-gold"
                  />
                  New Arrival
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-4 border-t border-luxury-lightgrey pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-luxury-lightgrey text-gray-500 rounded text-xs hover:bg-gray-50 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-luxury-black text-white rounded text-xs hover:bg-luxury-black/90 font-bold uppercase tracking-wider disabled:bg-gray-400"
                >
                  {addLoading ? "Creating..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Product Modal Overlay */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white border border-luxury-lightgrey rounded-sm shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-luxury-lightgrey mb-6">
              <h2 className="font-playfair text-sm font-bold uppercase tracking-widest text-luxury-black">
                Edit Product
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gold text-sm font-bold focus:outline-none"
                type="button"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleEditProductSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    required
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. Velvet Musk EDP"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Category
                  </label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    required
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. 1999"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Sale Price (INR)
                  </label>
                  <input
                    type="number"
                    value={editProdSalePrice}
                    onChange={(e) => setEditProdSalePrice(e.target.value)}
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="Leave blank if no sale"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                    min="0"
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                    placeholder="e.g. 50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Gender *
                  </label>
                  <select
                    value={editProdGender}
                    onChange={(e) => setEditProdGender(e.target.value)}
                    required
                    className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editProdShortDesc}
                  onChange={(e) => setEditProdShortDesc(e.target.value)}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  placeholder="Brief tagline for product list/quick view"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Detailed Description *
                </label>
                <textarea
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  required
                  rows={3}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold resize-none"
                  placeholder="Describe the fragrance structure, ingredients, and character..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Fragrance Notes (Comma separated)
                </label>
                <input
                  type="text"
                  value={editProdNotes}
                  onChange={(e) => setEditProdNotes(e.target.value)}
                  className="border border-luxury-lightgrey text-xs px-3 py-2 bg-luxury-deep text-luxury-black rounded focus:outline-none focus:border-gold"
                  placeholder="Top, Heart, Base notes"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Add / Replace Images (Up to 10 · JPG, PNG, WEBP · Max 5MB
                  each)
                </label>
                <div
                  className="border border-dashed border-luxury-lightgrey rounded bg-luxury-deep px-3 py-4 text-center cursor-pointer hover:border-gold transition-colors"
                  onClick={() =>
                    document.getElementById("edit-image-upload").click()
                  }
                >
                  <input
                    id="edit-image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setEditProdFiles(e.target.files)}
                    className="hidden"
                  />
                  {editProdFiles && editProdFiles.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-gold font-semibold">
                        {editProdFiles.length} file
                        {editProdFiles.length > 1 ? "s" : ""} selected
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {Array.from(editProdFiles).map((f, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-white border border-luxury-lightgrey text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[120px]"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">
                        Click to change selection
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-[10px] text-gray-400">
                        Click to add new images
                      </p>
                      <p className="text-[9px] text-gray-300">
                        Existing images will be kept · New uploads will be
                        appended
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProdFeatured}
                    onChange={(e) => setEditProdFeatured(e.target.checked)}
                    className="accent-gold"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProdBestSelling}
                    onChange={(e) => setEditProdBestSelling(e.target.checked)}
                    className="accent-gold"
                  />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProdNewArrival}
                    onChange={(e) => setEditProdNewArrival(e.target.checked)}
                    className="accent-gold"
                  />
                  New Arrival
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-4 border-t border-luxury-lightgrey pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-luxury-lightgrey text-gray-500 rounded text-xs hover:bg-gray-50 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-luxury-black text-white rounded text-xs hover:bg-luxury-black/90 font-bold uppercase tracking-wider disabled:bg-gray-400"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full border rounded px-4 py-3 mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="px-4 py-2 bg-gold text-white rounded"
              >
                {forgotLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>

            <input
              type="text"
              value={forgotOTP}
              onChange={(e) => setForgotOTP(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border rounded px-4 py-3 mb-3"
            />

            <input
              type="password"
              value={forgotNewPassword}
              onChange={(e) => setForgotNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border rounded px-4 py-3 mb-3"
            />

            <input
              type="password"
              value={forgotConfirmPassword}
              onChange={(e) => setForgotConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border rounded px-4 py-3 mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="px-4 py-2 bg-gold text-white rounded"
              >
                {resetLoading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32 text-gold text-xs uppercase tracking-widest font-semibold bg-luxury-deep">
          Loading Admin Panel...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
