export default function Modal({ isOpen, onClose, onConfirm, title, children }) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn">

        <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">
          {title}
        </h2>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}