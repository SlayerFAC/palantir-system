import { useState, useEffect } from "react";

export default function PortfolioModal({
  isOpen,
  onClose,
  onSave,
  initialData
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    await onSave({ name });
    setLoading(false);
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn">

        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Portfolio" : "Create Portfolio"}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Portfolio name"
          className="w-full border p-2 rounded mb-4
          bg-white dark:bg-gray-700
          border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!name || loading}
            className={`px-3 py-2 text-white rounded
              ${loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
          >
            {loading ? "Saving..." : initialData ? "Update" : "Create"}
          </button>

        </div>
      </div>
    </div>
  );
}