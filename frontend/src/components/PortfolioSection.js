import { useEffect, useState } from "react";
import {
  getPortfolios,
  createPortfolio,
  deletePortfolio,
  updatePortfolio
} from "../api";

import { toast } from "react-hot-toast";
import Skeleton from "./Skeleton";
import PortfolioModal from "./PortfolioModal";
import Modal from "./Modal";

export default function PortfolioSection() {

  const [portfolios, setPortfolios] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");

  // ✅ LOAD DATA
  const load = async () => {
    try {
      const list = await getPortfolios();

      console.log("FINAL LIST:", list);

      setPortfolios(list);
      setFiltered(list);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load portfolios");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ SEARCH
  useEffect(() => {
    const result = portfolios.filter((p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result);
  }, [search, portfolios]);

  // ✅ CREATE / UPDATE
  const handleSave = async (data) => {
    try {
      let res;

      if (editItem) {
        res = await updatePortfolio(editItem.id, data);
        toast.success("Updated ✅");
      } else {
        res = await createPortfolio(data);
        toast.success("Created ✅");
      }

      if (!res || res.error) throw new Error();

      setEditItem(null);
      load();

    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  // ✅ DELETE
  const openDelete = (id) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await deletePortfolio(selectedId);

      if (!res || res.error) throw new Error();

      toast.success("Deleted ✅");
      setDeleteModal(false);
      load();

    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded shadow mb-6 animate-fadeIn">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Portfolios</h2>

        <button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          + New
        </button>
      </div>

      <input
        placeholder="Search portfolios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded mb-4 bg-white dark:bg-gray-700"
      />

      {loading ? (
        <Skeleton lines={4} />
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          No portfolios found 📊
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th>Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">

                <td className="py-3 font-medium">{p.name}</td>

                <td>
                  <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                    {p.status || "active"}
                  </span>
                </td>

                <td className="text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditItem(p);
                      setModalOpen(true);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => openDelete(p.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PortfolioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        initialData={editItem}
      />

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Portfolio"
      >
        This action cannot be undone.
      </Modal>
    </div>
  );
}