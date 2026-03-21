// src/services/orderService.ts
import axios from "axios";

/** =========================
 *  CONFIG
 *  ========================= */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5151";
const ORDER_BASE = `${API_URL}/api/Order`;

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** =========================
 *  TYPES
 *  ========================= */
export type Order = {
  id: number;
  number?: number | null;
  date?: string | null; // "YYYY-MM-DD"
  isactive?: boolean | null;
  idTable?: number | null;

  // opcional (front-only)
  tableNumber?: number | null;
};

export type CreateOrderPayload = {
  number: number;
  date: string; // "YYYY-MM-DD"
  idTable: number;
};

export type UpdateOrderPayload = {
  number: number;
  date: string; // "YYYY-MM-DD"
  idTable: number;
};

export type TicketLine = {
  id: number; // id del platillo
  name: string;
  price: number;
  qty: number;
};

export type LocalTicket = {
  localId: string;

  // puede venir vacío si el back no devuelve el ID al crear
  orderId?: number;
  orderNumber: number;

  tableId: number;
  tableNumber: number;

  date: string; // "YYYY-MM-DD"
  createdAtMs: number;

  status: "ACTIVA" | "CANCELADA";

  lines: TicketLine[];
};

type ApiResponse<T> = {
  isSuccess: boolean;
  value: T;
};

/** =========================
 *  API (BACK)
 *  ========================= */
export async function listOrders(): Promise<Order[]> {
  const res = await fetch(`${ORDER_BASE}/List`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (res.status === 404) return [];

  const data = (await res.json().catch(() => ({}))) as Partial<ApiResponse<Order[]>> & {
    value?: any;
  };

  if (!res.ok) {
    throw new Error((data as any)?.value ?? "Error listando órdenes");
  }

  return (data.value ?? []) as Order[];
}

export async function createOrder(payload: CreateOrderPayload) {
  const form = new FormData();
  form.append("Number", String(payload.number));
  form.append("Date", payload.date);
  form.append("IdTable", String(payload.idTable));

  const res = await fetch(`${ORDER_BASE}/Add`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any)?.value ?? "Error creando orden");
  }

  return data;
}

export async function updateOrder(orderId: number, payload: UpdateOrderPayload) {
  const form = new FormData();
  form.append("Number", String(payload.number));
  form.append("Date", payload.date);
  form.append("IdTable", String(payload.idTable));

  const res = await fetch(`${ORDER_BASE}/Update/${orderId}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any)?.value ?? "Error actualizando orden");
  }

  return data;
}

export async function deleteOrder(orderId: number) {
  const res = await fetch(`${ORDER_BASE}/Delete/${orderId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any)?.value ?? "Error eliminando orden");
  }

  return data;
}

/** =========================
 *  LOCAL STORAGE (Camino B)
 *  ========================= */
const LS_KEY = "orders_tickets_v1";

/** Normaliza fechas para poder comparar aunque vengan distintas */
function normalizeDate(d: any): string {
  if (!d) return "";
  const s = String(d);
  // si viene "YYYY-MM-DD..." cortamos a 10
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") return s.slice(0, 10);

  // si viene "MM/DD/YYYY"
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;

  // fallback: intento Date()
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);

  return s.slice(0, 10);
}

function readTickets(): LocalTicket[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalTicket[]) : [];
  } catch {
    return [];
  }
}

function writeTickets(tickets: LocalTicket[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tickets));
}

/** Guardar ticket nuevo (no hace merge) */
export function saveLocalTicket(ticket: LocalTicket) {
  const tickets = readTickets();
  writeTickets([ticket, ...tickets]);
}

/** Insert/Update ticket por localId (o por orderId si existe) */
export function upsertLocalTicket(ticket: LocalTicket) {
  const tickets = readTickets();

  const idxByOrderId =
    ticket.orderId != null ? tickets.findIndex((t) => t.orderId === ticket.orderId) : -1;

  const idxByLocalId = tickets.findIndex((t) => t.localId === ticket.localId);

  const idx = idxByOrderId !== -1 ? idxByOrderId : idxByLocalId;

  if (idx === -1) {
    writeTickets([ticket, ...tickets]);
    return;
  }

  const next = [...tickets];
  next[idx] = ticket;
  writeTickets(next);
}

/** Obtener ticket por orderId */
export function getLocalTicketByOrderId(orderId: number) {
  const tickets = readTickets();
  return tickets.find((t) => t.orderId === orderId) ?? null;
}

/** Eliminar ticket local por orderId */
export function removeLocalTicketByOrderId(orderId: number) {
  const tickets = readTickets();
  writeTickets(tickets.filter((t) => t.orderId !== orderId));
}

/** Actualizar solo encabezado (sin tocar líneas) */
export function updateLocalTicketHeader(
  orderId: number,
  patch: Partial<Pick<LocalTicket, "orderNumber" | "date" | "tableId" | "tableNumber" | "status">>
) {
  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.orderId === orderId);
  if (idx === -1) return;

  const next = [...tickets];
  next[idx] = { ...next[idx], ...patch };
  writeTickets(next);
}

/** Listar todos los tickets locales */
export function listLocalTickets(): LocalTicket[] {
  return readTickets();
}

/** =========================
 *  ✅ NUEVO: helpers para EDITAR
 *  ========================= */

/**
 * Busca el ticket local para una orden:
 * 1) por orderId (ideal)
 * 2) si no existe, por combinación: (orderNumber + tableId + date normalizada)
 */
export function getLocalTicketForOrder(order: Order): LocalTicket | null {
  const tickets = readTickets();

  // 1) match ideal
  const byId = tickets.find((t) => t.orderId === order.id);
  if (byId) return byId;

  // 2) fallback por claves
  const orderNumber = Number(order.number ?? 0);
  const tableId = Number(order.idTable ?? 0);
  const date = normalizeDate(order.date);

  if (!orderNumber || !tableId || !date) return null;

  return (
    tickets.find(
      (t) =>
        Number(t.orderNumber) === orderNumber &&
        Number(t.tableId) === tableId &&
        normalizeDate(t.date) === date
    ) ?? null
  );
}

/**
 * Si encontramos un ticket “viejo” (sin orderId),
 * lo amarramos al orderId actual para que ya siempre funcione editar/ver ticket.
 */
export function attachOrderIdToLocalTicket(localId: string, orderId: number) {
  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.localId === localId);
  if (idx === -1) return;

  // si ya tenía, no tocar
  if (tickets[idx].orderId != null) return;

  const next = [...tickets];
  next[idx] = { ...next[idx], orderId };
  writeTickets(next);
}
