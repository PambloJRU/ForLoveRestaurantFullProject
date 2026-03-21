import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Table } from "@/types/Table";
import {
  createOrder,
  saveLocalTicket,
  type LocalTicket,
  type TicketLine,
} from "@/services/orderService";
import { listMenuItems, menuItemPhotoUrl } from "@/services/menuItem";
import type { MenuItem } from "@/types/MenuItem";

type Props = {
  open: boolean;
  table: Table | null;
  onClose: () => void;
  onCreated?: () => void; // para refrescar o navegar
};

const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const money = (n: number) => `₡ ${n.toLocaleString("es-CR")}`;

export default function CreateOrderModal({
  open,
  table,
  onClose,
  onCreated,
}: Props) {
  const [number, setNumber] = useState<number>(Math.floor(1000 + Math.random() * 9000));
  const [date, setDate] = useState<string>(todayISO());
  const [saving, setSaving] = useState(false);

  // menu items
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [q, setQ] = useState("");

  // ticket lines (local)
  const [lines, setLines] = useState<TicketLine[]>([]);

  useEffect(() => {
    if (!open) return;

    // reset básico al abrir
    setNumber(Math.floor(1000 + Math.random() * 9000));
    setDate(todayISO());
    setLines([]);
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
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(qq));
  }, [items, q]);

  const addLine = (mi: MenuItem) => {
    setLines((prev) => {
      const found = prev.find((x) => x.id === mi.id);
      if (found) {
        return prev.map((x) => (x.id === mi.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          id: mi.id,
          name: mi.name ?? "Platillo",
          price: Number(mi.price ?? 0),
          qty: 1,
        },
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

  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + l.price * l.qty, 0),
    [lines]
  );
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  // Intenta extraer el ID devuelto por la API (varias formas comunes)
  const extractOrderId = (res: any): number | undefined => {
    const v =
      res?.data?.id ??
      res?.data?.value ??
      res?.data?.data?.id ??
      res?.data?.data?.value ??
      res?.data?.result?.id ??
      res?.data?.result?.value;

    return typeof v === "number" ? v : undefined;
  };

  const handleCreate = async () => {
    if (!table) return;

    if (!number || number <= 0) {
      toast.error("Número de orden inválido");
      return;
    }
    if (!date) {
      toast.error("Fecha obligatoria");
      return;
    }

    try {
      setSaving(true);

      // 1) Guardar encabezado en BACK
      const res = await createOrder({ number, date, idTable: table.id });

      // ✅ si el back devuelve id, lo guardamos en el ticket local
      const createdOrderId = extractOrderId(res);

      // 2) Guardar detalle local (Camino B)
      const ticket: LocalTicket = {
        localId: crypto.randomUUID(),
        orderId: createdOrderId, // ✅ clave para que OrdersPage pueda encontrarlo
        orderNumber: number,
        tableId: table.id,
        tableNumber: table.number,
        date,
        createdAtMs: Date.now(),
        status: "ACTIVA",
        lines,
      };

      saveLocalTicket(ticket);

      toast.success("Orden creada");
      onClose();
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? e?.message ?? "Error creando orden");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !table) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-2xl border border-border bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
          {/* LEFT: Productos */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Platillos</h2>
              <div className="text-sm text-muted-foreground">Mesa #{table.number}</div>
            </div>

            <div className="mt-4 flex gap-3">
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

          {/* RIGHT: Ticket */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-playfair font-semibold">Crear orden</div>
                <div className="text-muted-foreground mt-1">Mesa #{table.number}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Número de orden *
                </label>
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
                <div className="text-sm text-muted-foreground">
                  Tocá un platillo de la lista para agregarlo.
                </div>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{l.name}</div>
                        <div className="text-sm text-muted-foreground">{money(l.price)}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decLine(l.id)}
                          className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition"
                        >
                          −
                        </button>
                        <div className="w-8 text-center font-semibold">{l.qty}</div>
                        <button
                          type="button"
                          onClick={() => incLine(l.id)}
                          className="h-8 w-8 rounded-lg border border-border hover:bg-muted transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-bold">{money(l.price * l.qty)}</div>
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
                onClick={handleCreate}
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear"}
              </button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Nota: detalle de platillos se guarda local (Camino B).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
