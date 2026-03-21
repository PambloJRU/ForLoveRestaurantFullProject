import type { OrderItem } from "@/types/OrderItem";

export type OrderDraft = {
  orderId: number;       
  tableId: number;
  tableNumber: number;
  number: number;
  date: string;         
  createdAt: string;     
  items: OrderItem[];
};

const KEY = "orderDrafts";

export function getDrafts(): OrderDraft[] {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as OrderDraft[]) : [];
}

export function saveDraft(draft: OrderDraft) {
  const drafts = getDrafts().filter(d => d.orderId !== draft.orderId);
  drafts.push(draft);
  sessionStorage.setItem(KEY, JSON.stringify(drafts));
}

export function getDraft(orderId: number) {
  return getDrafts().find(d => d.orderId === orderId) ?? null;
}

export function removeDraft(orderId: number) {
  const drafts = getDrafts().filter(d => d.orderId !== orderId);
  sessionStorage.setItem(KEY, JSON.stringify(drafts));
}
