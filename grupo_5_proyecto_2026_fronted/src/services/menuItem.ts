import type { MenuItem, MenuItemFormData } from "@/types/MenuItem";
const API_URL = "http://localhost:5151";

function getToken(): string | null {
  const t1 = sessionStorage.getItem("token");
  if (t1) return t1;
  try {
    const u = JSON.parse(sessionStorage.getItem("user") ?? "null");
    if (u?.token) return u.token;
  } catch {}

  const t2 = localStorage.getItem("token");
  if (t2) return t2;

  return null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const menuItemPhotoUrl = (photo?: string | null) => {
  if (!photo) return "";
  return `${API_URL}${photo}`;
};

export async function listMenuItems(): Promise<MenuItem[]> {
  const res = await fetch(`${API_URL}/api/MenuItem/List`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.value ?? `Error listando platillos (${res.status})`);
  }

  return (data?.value ?? []) as MenuItem[];
}

export async function addMenuItem(payload: MenuItemFormData) {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  formData.append("Price", payload.price);

  if (payload.photoFile) {
    formData.append("Photo", payload.photoFile);
  }

  const res = await fetch(`${API_URL}/api/MenuItem/Add`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    console.log("Add MenuItem ERROR:", res.status, data);
    throw new Error(data?.value ?? `Error agregando platillo (${res.status})`);
  }

  return data;
}

export async function getMenuItemById(id: number): Promise<MenuItem> {
  if (!id || id <= 0) {
    throw new Error("ID inválido");
  }

  const res = await fetch(`${API_URL}/api/MenuItem/GetById/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    console.error("GetById JSON parse error:", e);
  }

  if (!res.ok) {
    console.error("GetById MenuItem ERROR:", res.status, data);
    throw new Error(data?.value ?? `Error obteniendo platillo (${res.status})`);
  }

  if (!data?.value) {
    throw new Error("Respuesta inválida del servidor");
  }

  return data.value as MenuItem;
}

export async function updateMenuItem(id: number, payload: MenuItemFormData) {
  const formData = new FormData();
  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  formData.append("Price", payload.price);

  if (payload.photoFile) {
    formData.append("Photo", payload.photoFile);
  }

  const res = await fetch(`${API_URL}/api/MenuItem/Edit/${id}`, { // CORREGIDO
    method: "PUT",
    headers: {
      ...authHeaders(),
    },
    body: formData,
  });

  let data: any = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    console.log("Update MenuItem ERROR:", res.status, data);
    throw new Error(data?.value ?? `Error editando platillo (${res.status})`);
  }

  return data;
}


export async function deleteMenuItem(id: number) {
  const res = await fetch(`${API_URL}/api/MenuItem/Delete/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  let data: any = {};
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    console.log("Delete MenuItem ERROR:", res.status, data);
    throw new Error(data?.value ?? `Error eliminando platillo (${res.status})`);
  }

  return data;
}

