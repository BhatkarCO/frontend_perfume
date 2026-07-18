"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //changed
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * Register Action
   */
  const register = async (name, email, password, phone) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
        errors: error.response?.data?.errors || [],
      };
    }
  };

  /**
   * Login Action
   */
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        //changed
        email,
        password,
      });

      const { user: loggedUser } = response.data;

      setUser(loggedUser);

      return {
        success: true,
        user: loggedUser,
      };
  
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed.",
        errors: error.response?.data?.errors || [],
      };
    }
  };

  /**
   * Logout Action
   */
  const logout = async () => {
    //changed
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    }

    setUser(null);
  };

  /**
   * Verify Email / OTP Action
   */
  const verifyEmailOTP = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      const { user: verifiedUser } = response.data; //changed

      setUser(verifiedUser);

      return {
        success: true,
      };

    } catch (error) {
      console.error("OTP verify error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "OTP verification failed.",
        errors: error.response?.data?.errors || [],
      };
    }
  };

  /**
   * Resend verification OTP
   */
  const resendOTP = async (email, purpose = "register") => {
    try {
      await api.post("/auth/resend-otp", { email, purpose });
      return { success: true };
    } catch (error) {
      console.error("Resend OTP error:", error);
      const message = error.response?.data?.message || "Failed to resend OTP.";
      return { success: false, message };
    }
  };

  /**
   * Forgot Password
   */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Forgot password error:", error);
      const message =
        error.response?.data?.message || "Forgot password request failed.";
      return {
        success: false,
        message,
        errors: error.response?.data?.errors || [],
      };
    }
  };

  /**
   * Verify Forgot Password OTP
   */
 const verifyForgotPasswordOTP = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-forgot-password", {
      email,
      otp,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);

    return {
      success: false,
      message:
        error.response?.data?.message || "OTP verification failed.",
      errors: error.response?.data?.errors || [],
    };
  }
};

  /**
   * Reset Password
   */
  const resetPassword = async (email, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      newPassword,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Reset password error:", error);

    return {
      success: false,
      message:
        error.response?.data?.message || "Reset password request failed.",
      errors: error.response?.data?.errors || [],
    };
  }
};

  /**
   * Update Profile Details Locally
   */
  const updateLocalUserProfile = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser); //changed
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        verifyEmailOTP,
        verifyForgotPasswordOTP,
        resendOTP,
        forgotPassword,
        resetPassword,
        updateLocalUserProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
