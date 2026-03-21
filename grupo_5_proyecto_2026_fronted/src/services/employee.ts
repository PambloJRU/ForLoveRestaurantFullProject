import type { Employee } from "@/types/Employee";

const BASE = "http://localhost:5151";

const requireBase = () => {
  if (!BASE) {
    console.error("Falta VITE_API_URL. Revisa tu .env.local y reinicia el front.");
  }
  return BASE;
};

const authHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token ?? ""}`,
  };
};

export const listEmployees = async (): Promise<Employee[]> => {
  const base = requireBase();
  if (!base) return [];

  const res = await fetch(`${base}/api/Employee/List`, {
    headers: authHeaders(),
  });

  if (res.status === 401)
    throw new Error("No autorizado (token inválido o expirado)");
  if (!res.ok)
    throw new Error("Error listando empleados");

  const data = await res.json();
  return data.value ?? [];
};

export const addEmployee = async (employee: Employee) => {
  const base = requireBase();
  if (!base) throw new Error("No hay VITE_API_URL configurado.");

  const res = await fetch(`${base}/api/Employee/Add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(employee),
  });

  const data = await res.json();

  if (res.status === 401)
    throw new Error("No autorizado (token inválido o expirado)");

  if (!res.ok || data?.isSuccess === false) {
    throw new Error(data?.value ?? "Error registrando empleado");
  }

  return data;
};

export const editEmployee = async (id: number, employee: Employee) => {
  const base = requireBase();
  if (!base) throw new Error("No hay VITE_API_URL configurado.");

  const res = await fetch(`${base}/api/Employee/Edit/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(employee),
  });

  const data = await res.json();

  if (res.status === 401)
    throw new Error("No autorizado (token inválido o expirado)");

  if (!res.ok || data?.isSuccess === false) {
    throw new Error(data?.value ?? "Error editando empleado");
  }

  return data;
};

//  se usa el endpoint Delete
export const disableEmployee = async (id: number) => {
  const base = requireBase();
  if (!base) throw new Error("No hay VITE_API_URL configurado.");

  const res = await fetch(`${base}/api/Employee/Delete/${id}`, {
    method: "PUT",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (res.status === 401)
    throw new Error("No autorizado (token inválido o expirado)");

  if (!res.ok || data?.isSuccess === false) {
    throw new Error(data?.value ?? "Error deshabilitando empleado");
  }

  return data;
};

export const enableEmployee = async (employee: Employee) => {
  const base = requireBase();
  if (!base) throw new Error("No hay VITE_API_URL configurado.");

  const res = await fetch(`${base}/api/Employee/Add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(employee),
  });

  const data = await res.json();

  if (res.status === 401)
    throw new Error("No autorizado (token inválido o expirado)");

  if (!res.ok || data?.isSuccess === false) {
    throw new Error(data?.value ?? "Error activando empleado");
  }

  return data;
};
