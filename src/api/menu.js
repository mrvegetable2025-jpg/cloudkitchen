// src/api/menu.js
export async function fetchMenu() {
  const base = import.meta.env.VITE_SHEET_MENU_CSV_URL;
  if (!base) {
    console.error("❌ VITE_SHEET_MENU_CSV_URL is missing");
    return [];
  }

  // 🚀 FORCE NO CACHE – always fresh menu from Google Sheet
  const sep = base.includes("?") ? "&" : "?";
  const url = `${base}${sep}cb=${Date.now()}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  const text = await res.text();

  // --- BASIC FAST CSV PARSER ---
  const rows = text.trim().split("\n");
  const headers = rows[0].split(",");

  const list = rows.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h.trim()] = (cols[i] || "").trim()));
    return obj;
  });

  return list.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    category: (r.category || "").toLowerCase(),
    isActive: (r.isActive || "").toLowerCase() === "true",
    availableDays: r.availableDays?.split(",") || [],
    imageUrl: r.imageUrl,
  }));
}

export async function fetchMeal(meal) {
  const list = await fetchMenu();
  return list.filter(
    (item) => item.category === meal.toLowerCase() && item.isActive
  );
}
