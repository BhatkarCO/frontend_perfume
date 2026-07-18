"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Truck,
  Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/api";

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, updateLocalUserProfile } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const tabParam = searchParams.get("tab") || "profile";

  // State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [deleteOTP, setDeleteOTP] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Address edit state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    } else {
      router.push("/login");
      return;
    }

    if (tabParam === "addresses") fetchAddresses();
    if (tabParam === "orders") fetchOrders();
    if (tabParam === "wishlist") fetchWishlist();
  }, [tabParam, user, router]);

  const handleTabChange = (tabName) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabName);
    router.push(pathname + "?" + params.toString());
    setActiveOrder(null);
    setShowAddressForm(false);
  };

  // --- PROFILE LOGIC ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName) return;

    setUpdatingProfile(true);
    try {
      const response = await api.put("/user/profile", {
        name: profileName,
        phone: profilePhone,
      });
      toast.success(response.data.message);
      updateLocalUserProfile({ name: profileName, phone: profilePhone });
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setUpdatingPassword(true);
    try {
      await api.put("/user/password", { oldPassword, newPassword });
      toast.success("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleRequestDeleteOTP = async () => {
    try {
      setSendingOTP(true);

      await api.post("/user/profile/delete-request");

      toast.success("OTP sent to your registered email.");

      setShowDeleteModal(false);
      setShowOTPModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSendingOTP(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteOTP.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      setDeletingAccount(true);

      await api.delete("/user/profile", {
        data: { otp: deleteOTP },
      });

      toast.success("Your account has been deleted successfully.");

      setShowOTPModal(false);
      setDeleteOTP("");

      toast.success("Account deleted successfully.");

      logout();

      router.replace("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  // --- ADDRESSES LOGIC ---
  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
    } catch (err) {
      console.error("Fetch addresses error:", err);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !postalCode || !phone) return;

    try {
      const payload = {
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        phone,
      };

      if (editAddressId) {
        await api.put(`/addresses/${editAddressId}`, payload);
        toast.success("Address updated.");
      } else {
        await api.post("/addresses", payload);
        toast.success("Address added.");
      }

      fetchAddresses();
      setShowAddressForm(false);
      setEditAddressId(null);
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setPhone("");
    } catch (err) {
      toast.error("Failed to save address.");
    }
  };

  const handleEditAddressInit = (addr) => {
    setEditAddressId(addr.id);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setPhone(addr.phone);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted.");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  // --- ORDERS LOGIC ---
  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/my-orders/${orderId}`);
      setActiveOrder(response.data);
    } catch (err) {
      toast.error("Failed to fetch order details.");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      toast.info("Downloading invoice PDF...");
      const response = await api.get(`/orders/invoice/${orderId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_Bhatkar_Co_${orderId}.pdf`;
      link.click();
      toast.success("Invoice downloaded.");
    } catch (err) {
      toast.error("Failed to download invoice.");
    }
  };

  // --- WISHLIST LOGIC ---
  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data);
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success("Removed from wishlist.");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove item.");
    }
  };

  const handleMoveToCart = (prod) => {
    addToCart(prod, 1);
    toast.success(`${prod.name} added to bag.`);
  };

  const getStatusStepIndex = (status) => {
    const steps = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
    ];
    return steps.indexOf(status);
    
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh] bg-luxury-deep">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1.5 bg-white p-4 border border-luxury-lightgrey rounded-sm h-fit shadow-sm">
          <div className="pb-4 border-b border-luxury-lightgrey mb-2 px-2">
            <h2 className="font-playfair text-sm font-bold text-luxury-black uppercase tracking-wider">
              My Account
            </h2>
            <p className="text-[10px] text-gray-400 font-light truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          {[
            { id: "profile", name: "Profile Details", icon: User },
            { id: "addresses", name: "Saved Addresses", icon: MapPin },
            { id: "orders", name: "My Orders", icon: ShoppingBag },
            { id: "wishlist", name: "My Wishlist", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full py-2.5 px-4 rounded-sm text-left text-[10px] uppercase tracking-widest font-semibold flex items-center gap-3 transition-colors ${
                  tabParam === tab.id
                    ? "bg-gold text-white font-bold"
                    : "text-gray-400 hover:text-gold hover:bg-luxury-deep"
                }`}
                type="button"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.name}
              </button>
            );
          })}

          <hr className="border-luxury-lightgrey my-2" />
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 text-left text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-500/5 rounded-sm transition-colors"
            type="button"
          >
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 px-4 text-left text-[10px] uppercase tracking-widest font-bold text-red-700 hover:bg-red-700/5 rounded-sm transition-colors mt-0.5"
            type="button"
          >
            Delete Account
          </button>
        </aside>

        {/* Content Panel */}
        <div className="flex-1">
          {/* TAB 1: PROFILE DETAILS */}
          {tabParam === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Details Edit */}
              <form
                onSubmit={handleUpdateProfile}
                className="bg-white p-6 rounded-sm border border-luxury-lightgrey flex flex-col gap-4 shadow-sm"
              >
                <h3 className="font-playfair text-[10px] uppercase tracking-widest text-luxury-black font-bold">
                  Personal Profile
                </h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn-gold self-start px-8 py-2.5 text-xs rounded-sm uppercase font-bold tracking-widest"
                >
                  {updatingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>

              {/* Security Password Change */}
              <form
                onSubmit={handleUpdatePassword}
                className="bg-white p-6 rounded-sm border border-luxury-lightgrey flex flex-col gap-4 shadow-sm"
              >
                <h3 className="font-playfair text-[10px] uppercase tracking-widest text-luxury-black font-bold">
                  Change Password
                </h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    Old Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="btn-gold self-start px-8 py-2.5 text-xs rounded-sm uppercase font-bold tracking-widest"
                >
                  {updatingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {tabParam === "addresses" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center pb-4 border-b border-luxury-lightgrey">
                <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black">
                  Saved Addresses
                </h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="btn-gold px-4 py-2 text-xs rounded-sm uppercase tracking-wider font-bold"
                    type="button"
                  >
                    Add Address
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form
                  onSubmit={handleSaveAddress}
                  className="bg-white p-6 rounded-sm border border-luxury-lightgrey flex flex-col gap-4 max-w-xl shadow-sm"
                >
                  <h4 className="font-playfair text-xs uppercase tracking-widest text-luxury-black font-bold">
                    {editAddressId ? "Edit Address" : "New Shipping Address"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2.5 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="submit"
                      className="btn-gold px-6 py-2.5 text-xs rounded-sm uppercase font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditAddressId(null);
                      }}
                      className="border border-luxury-black text-luxury-black hover:bg-luxury-deep px-6 py-2.5 text-xs rounded-sm uppercase font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      No addresses saved yet.
                    </p>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 bg-white border border-luxury-lightgrey rounded-sm flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                            {addr.is_default
                              ? "Default Shipping"
                              : "Saved Destination"}
                          </span>
                          <p className="text-xs text-gray-600 leading-relaxed mt-2 font-light">
                            {addr.address_line1},{" "}
                            {addr.address_line2 && `${addr.address_line2}, `}
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                            Phone: {addr.phone}
                          </p>
                        </div>
                        <div className="flex gap-3 border-t border-luxury-deep pt-2">
                          <button
                            onClick={() => handleEditAddressInit(addr)}
                            className="text-gold text-xs flex items-center gap-1 hover:text-gold-dark font-bold"
                            type="button"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-red-500 text-xs flex items-center gap-1 hover:text-red-600 font-bold"
                            type="button"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ORDERS */}
          {tabParam === "orders" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black pb-4 border-b border-luxury-lightgrey">
                    My Orders
                  </h3>
                </div>
                <div className="max-w-xs w-full">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                    Search by Order ID
                  </label>
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Enter order number"
                    className="w-full bg-luxury-deep border border-luxury-lightgrey text-luxury-black text-xs px-4 py-2 rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {!activeOrder ? (
                /* Orders List */
                <div className="flex flex-col gap-4">
                  {orders.filter((ord) =>
                    ord.id.toString().includes(orderSearchQuery.trim()),
                  ).length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      No orders match that ID.
                    </p>
                  ) : (
                    orders
                      .filter((ord) =>
                        ord.id.toString().includes(orderSearchQuery.trim()),
                      )
                      .map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 bg-white border border-luxury-lightgrey rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold/45 transition-all shadow-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-luxury-black">
                                Order #{ord.id}
                              </span>
                              <span
                                className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                                  ord.status === "Delivered"
                                    ? "bg-green-500/10 text-green-600"
                                    : ord.status === "Cancelled"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-yellow-500/10 text-yellow-600"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <span className="text-[9px] text-gray-400 block mt-1 uppercase tracking-wider font-semibold">
                              Date:{" "}
                              {new Date(ord.created_at).toLocaleDateString(
                                "en-IN",
                              )}{" "}
                              • Items: {ord.total_items}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-sm font-bold text-luxury-black">
                              ₹{parseFloat(ord.total_amount).toFixed(0)}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewOrder(ord.id)}
                                className="border border-luxury-black hover:bg-luxury-deep text-luxury-black text-[10px] px-3 py-1.5 rounded-sm uppercase tracking-widest font-bold"
                                type="button"
                              >
                                Track
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(ord.id)}
                                className="bg-luxury-deep border border-luxury-lightgrey text-gray-400 hover:text-gold p-2 rounded-sm"
                                title="Download Invoice"
                                type="button"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                /* Single Order tracker view */
                <div className="flex flex-col gap-6 bg-white border border-luxury-lightgrey p-6 rounded-sm shadow-sm">
                  <div className="flex justify-between items-center border-b border-luxury-lightgrey pb-4">
                    <button
                      onClick={() => setActiveOrder(null)}
                      className="text-[10px] text-gold font-bold uppercase tracking-widest"
                      type="button"
                    >
                      &larr; Back to List
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(activeOrder.id)}
                      className="btn-gold px-4 py-2 text-xs rounded-sm uppercase font-bold flex items-center gap-1.5"
                      type="button"
                    >
                      <Download className="w-4 h-4" /> Invoice
                    </button>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <div>
                      <p>
                        <strong>Order ID:</strong> #{activeOrder.id}
                      </p>
                      <p className="mt-1">
                        <strong>Payment ID:</strong>{" "}
                        {activeOrder.razorpay_payment_id || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>
                        <strong>Grand Total:</strong> ₹
                        {parseFloat(activeOrder.total_amount).toFixed(0)}
                      </p>
                      <p className="mt-1">
                        <strong>Status:</strong>{" "}
                        {activeOrder.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Visual Tracker Bar */}
                  {activeOrder.status !== "Cancelled" && (
                    <div className="my-6">
                      <h4 className="text-[10px] uppercase tracking-widest text-luxury-black font-bold mb-4 text-center sm:text-left">
                        Delivery Progress
                      </h4>
                      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-2 relative">
                        {/* Connecting Line */}
                        <div className="hidden sm:block absolute left-4 right-4 top-4 h-0.5 bg-luxury-deep z-0">
                          <div
                            className="bg-gold h-full transition-all duration-500"
                            style={{
                              width: `${(getStatusStepIndex(activeOrder.status) / 4) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Steps */}
                        {[
                          "Pending",
                          "Confirmed",
                          "Processing",
                          "Shipped",
                          "Delivered",
                        ].map((step, idx) => {
                          const activeStepIdx = getStatusStepIndex(
                            activeOrder.status,
                          );
                          const isDone = idx <= activeStepIdx;
                          const isCurrent = idx === activeStepIdx;

                          return (
                            <div
                              key={step}
                              className="flex sm:flex-col items-center gap-3 sm:gap-1.5 z-10"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                                  isCurrent
                                    ? "border-gold bg-gold text-white"
                                    : isDone
                                      ? "border-gold bg-gold/10 text-gold"
                                      : "border-gray-300 bg-luxury-deep text-gray-400"
                                }`}
                              >
                                {step === "Pending" && (
                                  <Clock className="w-4 h-4" />
                                )}
                                {step === "Confirmed" && (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                {step === "Processing" && (
                                  <Edit className="w-4 h-4" />
                                )}
                                {step === "Shipped" && (
                                  <Truck className="w-4 h-4" />
                                )}
                                {step === "Delivered" && (
                                  <HomeIcon className="w-4 h-4" />
                                )}
                              </div>
                              <span
                                className={`text-[9px] uppercase tracking-widest font-bold ${
                                  isCurrent
                                    ? "text-gold"
                                    : isDone
                                      ? "text-gray-700"
                                      : "text-gray-400"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="border-t border-luxury-lightgrey pt-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold mb-3">
                      Order Items
                    </h4>
                    <div className="flex flex-col gap-3">
                      {activeOrder.items &&
                        activeOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 items-center"
                          >
                            <div className="relative w-10 h-12 shrink-0 bg-luxury-deep border border-luxury-lightgrey rounded overflow-hidden">
                              <Image
                                src={
                                  item.primary_image ||
                                  item.image_url ||
                                  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100"
                                }
                                alt={item.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-luxury-black font-playfair">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-light">
                                Qty: {item.quantity} • ₹
                                {parseFloat(item.price_at_purchase).toFixed(0)}{" "}
                                each
                              </p>
                            </div>
                            <span className="text-xs font-bold text-luxury-black">
                              ₹
                              {(
                                parseFloat(item.price_at_purchase) *
                                item.quantity
                              ).toFixed(0)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Shipping Destination */}
                  <div className="border-t border-luxury-lightgrey pt-4 text-xs text-gray-500 font-light">
                    <h4 className="text-[10px] uppercase tracking-widest text-luxury-black font-bold mb-2">
                      Shipping Destination
                    </h4>
                    <p>
                      {activeOrder.address_line1},{" "}
                      {activeOrder.address_line2 &&
                        `${activeOrder.address_line2}, `}
                      {activeOrder.city}, {activeOrder.state} -{" "}
                      {activeOrder.postal_code}
                    </p>
                    <p className="mt-1 font-semibold">
                      Contact Phone: {activeOrder.shipping_phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          

          {/* TAB 4: WISHLIST */}
          {tabParam === "wishlist" && (
            <div className="flex flex-col gap-6">
              <h3 className="font-playfair text-sm uppercase tracking-widest font-bold text-luxury-black pb-4 border-b border-luxury-lightgrey">
                My Wishlist
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.length === 0 ? (
                  <p className="text-xs text-gray-500 italic col-span-full">
                    No products saved in your wishlist yet.
                  </p>
                ) : (
                  wishlist.map((prod) => {
                    const price = parseFloat(prod.price);
                    const salePrice = prod.sale_price
                      ? parseFloat(prod.sale_price)
                      : null;
                    return (
                      <div
                        key={prod.id}
                        className="luxury-card flex flex-col h-full group"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-luxury-darkgrey">
                          <Image
                            src={
                              prod.primary_image ||
                              prod.image_url ||
                              "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400"
                            }
                            alt={prod.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <button
                            onClick={() => handleRemoveWishlist(prod.id)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-red-500/10 text-red-500 p-1.5 rounded-full border border-luxury-lightgrey focus:outline-none"
                            title="Remove"
                            type="button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-3 flex flex-col gap-2 flex-1 justify-between bg-white border-t border-luxury-deep">
                          <div>
                            <h4 className="text-xs font-bold text-luxury-black line-clamp-1 font-playfair">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] font-bold text-gold-dark mt-1 block">
                              ₹{(salePrice || price).toFixed(0)}
                            </span>
                          </div>

                          {prod.stock_quantity > 0 ? (
                            <button
                              onClick={() => handleMoveToCart(prod)}
                              className="btn-gold w-full py-1.5 text-[9px] rounded-sm uppercase font-bold tracking-wider"
                              type="button"
                            >
                              Add to Bag
                            </button>
                          ) : (
                            <span className="text-[9px] text-center text-red-500 font-bold uppercase tracking-wider block py-1.5">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Delete Account</h2>

            <p className="text-gray-600">
              Are you sure you want to permanently delete your account?
            </p>

            <p className="text-red-600 mt-2">This action cannot be undone.</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestDeleteOTP}
                disabled={sendingOTP}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {sendingOTP ? "Sending..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOTPModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
            <h2 className="font-playfair text-2xl text-luxury-black mb-3">
              Verify OTP
            </h2>

            <p className="text-sm text-gray-500 leading-6 mb-5">
              We&apos;ve sent a verification OTP to your registered email. Enter it
              below to permanently delete your account.
            </p>

            <input
              type="text"
              value={deleteOTP}
              onChange={(e) => setDeleteOTP(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-between mt-6">
              <button
                onClick={async () => {
                  try {
                    setSendingOTP(true);
                    await api.post("/user/profile/delete-request");
                    toast.success("OTP sent again.");
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to resend OTP."
                    );
                  } finally {
                    setSendingOTP(false);
                  }
                }}
                disabled={sendingOTP}
                className="text-sm text-gold hover:underline disabled:opacity-50"
              >
                {sendingOTP ? "Sending..." : "Resend OTP"}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setDeleteOTP("");
                  }}
                  className="px-5 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32 text-gold text-xs uppercase tracking-widest font-semibold bg-luxury-deep">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
