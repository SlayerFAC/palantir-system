const API = "http://localhost:8000";

// ✅ GET (always returns ARRAY)
export async function getPortfolios() {
  const res = await fetch(`${API}/api/portfolios`, {
    credentials: "include",
  });

  const data = await res.json();

  console.log("RAW API:", data);

  // ✅ Normalize ALL possible shapes
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.portfolios)) return data.portfolios;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

// ✅ CREATE
export async function createPortfolio(payload) {
  const formData = new FormData();
  formData.append("name", payload.name);

  const res = await fetch(`${API}/api/portfolios`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return res.json();
}

// ✅ UPDATE
export async function updatePortfolio(id, payload) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("name", payload.name);

  const res = await fetch(`${API}/api/portfolios/update`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return res.json();
}

// ✅ DELETE
export async function deletePortfolio(id) {
  const formData = new FormData();
  formData.append("id", id);

  const res = await fetch(`${API}/api/portfolios/delete`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return res.json();
}