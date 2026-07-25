"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function DeleteConfirmationModal({
  isOpen,
  title = "Delete Address",
  description = "Are you sure you want to permanently delete this saved address?",
  warning = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[420px] rounded-lg bg-white shadow-2xl"
          >
            <div className="p-7">
              <h2
                className="text-[24px] font-semibold text-[#1a1a1a]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                {title}
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-gray-600">
                {description}
              </p>

              <p className="mt-3 text-[15px] font-medium text-red-600">
                {warning}
              </p>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {cancelText}
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="rounded-md bg-red-600 px-5 py-2.5 text-[15px] font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Deleting..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}