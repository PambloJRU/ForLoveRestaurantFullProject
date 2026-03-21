import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listMenuItems, menuItemPhotoUrl } from "@/services/menuItem";
import type { MenuItem } from "@/types/MenuItem";
import {
  type Order,
  type LocalTicket,
  type TicketLine,
  //getLocalTicketByOrderId,
  getLocalTicketForOrder,
  attachOrderIdToLocalTicket,
  upsertLocalTicket,
  updateOrder,
} from "@/services/orderService";

type Props = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdated: () => void; // refrescar lista
};

const money = (n: number) => `₡ ${n.toLocaleString("es-CR")}`;

export default function EditOrderModal({ open, order, onClose, onUpdated }: Props) {
  const [number, setNumber] = useState<number>(1);
  const [date, setDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // menu items
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [q, setQ] = useState("");

  // ticket lines (local)
  const [lines, setLines] = useState<TicketLine[]>([]);
  const [ticket, setTicket] = useState<LocalTicket | null>(null);

  useEffect(() => {
    if (!open || !order) return;

    // ✅ defaults seguros (porque en Order son opcionales)
    const n = Number(order.number ?? 1);
    const d = String(order.date ?? "").slice(0, 10); // "YYYY-MM-DD"

    setNumber(Number.isFinite(n) && n > 0 ? n : 1);
    setDate(d || new Date().toISOString().slice(0, 10));

    // ✅ ticket local: primero por orderId; si no existe, por (number + tableId + date)
const t = getLocalTicketForOrder(order);
setTicket(t);
setLines(t?.lines ?? []);

// ✅ si lo encontró pero no tenía orderId (tickets viejos), lo amarramos para próximas veces
if (t && !t.orderId) {
  attachOrderIdToLocalTicket(t.localId, order.id);
}

    setQ("");

    // cargar platillos
    (async () => {
      try {
        setLoadingItems(true);
        const data = await listMenuItems();
        setItems(data ?? []);
      } catch (e: any) {
        toast.error(e?.message ?? "Error cargando platillos");
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [open, order]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(qq));
  }, [items, q]);

  const addLine = (mi: MenuItem) => {
    setLines((prev) => {
      const found = prev.find((x) => x.id === mi.id);
      if (found) return prev.map((x) => (x.id === mi.id ? { ...x, qty: x.qty + 1 } : x));
      return [
        ...prev,
        { id: mi.id, name: mi.name ?? "Platillo", price: Number(mi.price ?? 0), qty: 1 },
      ];
    });
  };

  const decLine = (id: number) => {
    setLines((prev) => {
      const found = prev.find((x) => x.id === id);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((x) => x.id !== id);
      return prev.map((x) => (x.id === id ? { ...x, qty: x.qty - 1 } : x));
    });
  };

  const incLine = (id: number) => {
    setLines((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
  };

  const subtotal = useMemo(() => lines.reduce((acc, l) => acc + l.price * l.qty, 0), [lines]);
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const handleSave = async () => {
    if (!order) return;

    if (!number || number <= 0) return toast.error("Número inválido");
    if (!date) return toast.error("Fecha obligatoria");

    const idTable = Number(order.idTable ?? 0);
    if (!idTable) return toast.error("La orden no tiene mesa asignada (idTable).");

    try {
      setSaving(true);

      // 1) actualizar encabezado en back
      await updateOrder(order.id, { number, date, idTable });

      // 2) actualizar detalle local (Camino B)
      const base: LocalTicket =
        ticket ??
        ({
          localId: crypto.randomUUID(),
          orderId: order.id,
          orderNumber: number,
          tableId: idTable,
          tableNumber: Number(order.tableNumber ?? 0),
          date,
          createdAtMs: Date.now(),
          status: "ACTIVA",
          lines: [],
        } as LocalTicket);

      upsertLocalTicket({
        ...base,
        orderId: order.id,
        orderNumber: number,
        date,
        lines,
      });

      toast.success("Orden actualizada");
      onClose();
      onUpdated();
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? e?.message ?? "Error actualizando");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-2xl border border-border bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
          {/* LEFT */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Platillos</h2>
            </div>

            <div className="mt-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar platillos..."
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4 h-[440px] overflow-auto pr-2">
              {loadingItems ? (
                <div className="text-muted-foreground">Cargando platillos...</div>
              ) : filtered.length === 0 ? (
                <div className="text-muted-foreground">No hay platillos para mostrar.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((mi) => {
                    const img = menuItemPhotoUrl(mi.photo);
                    return (
                      <button
                        key={mi.id}
                        onClick={() => addLine(mi)}
                        className="w-full text-left flex gap-3 rounded-xl border border-border bg-black/20 hover:bg-black/30 transition p-3"
                      >
                        <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          {img ? (
                            <img src={img} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                              Sin foto
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-semibold">{mi.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {mi.description ?? ""}
                          </div>
                        </div>

                        <div className="font-bold">{money(Number(mi.price ?? 0))}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-6">
            <div className="text-2xl font-playfair font-semibold">Editar orden</div>
            <div className="text-muted-foreground mt-1">Pedido #{order.number ?? "-"}</div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Número de orden *</label>
                <input
                  value={number}
                  onChange={(e) => setNumber(Number(e.target.value))}
                  type="number"
                  className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Fecha *</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-black/30 p-4 h-[270px] overflow-auto">
              <div className="text-sm font-semibold mb-3">Detalle</div>

              {lines.length === 0 ? (
                <div className="text-sm text-muted-foreground">Tocá un platillo para agregarlo.</div>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => (
                    <div
                      key={l.id}
                      className="grid grid-cols-[1fr_130px_110px] items-center gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{l.name}</div>
                        <div className="text-sm text-muted-foreground">{money(l.price)}</div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => decLine(l.id)}
                          className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition"
                        >
                          −
                        </button>
                        <div className="w-8 text-center font-semibold">{l.qty}</div>
                        <button
                          onClick={() => incLine(l.id)}
                          className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold text-right">{money(l.price * l.qty)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-black/30 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (13%)</span>
                <span className="font-semibold">{money(iva)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold">{money(total)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-5 py-2 font-semibold hover:bg-muted transition"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
