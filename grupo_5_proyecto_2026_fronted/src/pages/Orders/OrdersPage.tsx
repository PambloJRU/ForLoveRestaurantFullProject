import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import OrderTicketModal from "@/components/orders/OrderTicketModal";
import EditOrderModal from "@/components/orders/EditOrderModal";
import {
  listOrders,
  deleteOrder,
  type Order,
  removeLocalTicketByOrderId,
  getLocalTicketByOrderId,
  getLocalTicketForOrder,
} from "@/services/orderService";
import { createPayment } from "@/services/paymentService";

const HOUR_MS = 60 * 60 * 1000;

const formatDate = (d: any) => {
  if (!d) return "-";
  if (typeof d === "string") return d.slice(0, 10);
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
};

export default function OrdersPage() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [ticketOpen, setTicketOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const [payingId, setPayingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listOrders();
      setOrders(data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ocultar del FRONT al pasar 1 hora (usando createdAtMs del ticket local)
  const visibleOrders = useMemo(() => {
    const now = Date.now();
    return (orders ?? []).filter((o) => {
      const data = listOrders();
      console.log("Órdenes recibidas:", data);
      // si ya fue pagada, ocultarla de una vez
      if (o.isactive === false) return false;

      const ticket = getLocalTicketByOrderId?.(o.id);
      if (ticket?.createdAtMs) {
        return now - ticket.createdAtMs < HOUR_MS;
      }
      return true;
    });
}, [orders]);

  const handleDelete = async (o: Order) => {
    try {
      await deleteOrder(o.id); //  elimina/desactiva en BD
      removeLocalTicketByOrderId(o.id); //  limpia local

      setOrders((prev) => prev.filter((x) => x.id !== o.id));
      toast.success("Orden eliminada");
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? "No se pudo eliminar la orden");
    }
  };

  const handlePay = async (o: Order) => {
    try {
      setPayingId(o.id);

    const ticket = getLocalTicketForOrder(o);
    const lines = ticket?.lines ?? [];

    if (lines.length === 0) {
         toast.error("Esta orden no tiene platillos. Edítala antes de pagar.");
        return;
    }

    const subtotal = ticket?.lines?.reduce((acc, l) => acc + l.price * l.qty, 0) ?? 0;
    const total = subtotal * 1.13; // IVA 13%

      console.log("El total de esta orden es: " + total);

      await createPayment({
        number: o.number ?? o.id,
        idOrder: o.id,
        isActive: true,
        amount: total
      });
      toast.success("Pago registrado");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? "No se pudo registrar el pago");
    } finally {
      setPayingId(null);
    }
  };

  const mesaLabel = (o: any) => {
    if (o.tableNumber != null) return o.tableNumber;
    return o.idTable ?? "-";
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-playfair font-semibold">Órdenes</h2>
              <p className="text-muted-foreground mt-1">
                Se mostrarán órdenes activas (se ocultan al cumplir 1 hora).
              </p>
            </div>

            <button
              onClick={load}
              className="rounded-lg border border-border px-5 py-2 font-semibold hover:bg-muted transition"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Refrescar"}
            </button>
          </div>

          {visibleOrders.length === 0 ? (
            <div className="text-muted-foreground">No hay órdenes para mostrar.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleOrders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-black/30 p-6">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Pedido
                  </div>

                  <div className="text-3xl font-bold mt-1">#{o.number ?? "-"}</div>

                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    <div>
                      <span className="text-foreground font-semibold">Mesa:</span>{" "}
                      {mesaLabel(o)}
                    </div>

                    <div>
                      <span className="text-foreground font-semibold">Fecha:</span>{" "}
                      {formatDate(o.date)}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setSelected(o);
                        setTicketOpen(true);
                      }}
                      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
                    >
                      Ver ticket
                    </button>

                    <button
                      onClick={() => handlePay(o)}
                      className="rounded-lg border border-emerald-500/50 px-4 py-2 font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
                      disabled={payingId === o.id}
                    >
                      {payingId === o.id ? "Pagando..." : "Pagar"}
                    </button>

                    {/* EDITAR */}
                    <button
                      title="Editar"
                      onClick={() => {
                        setEditing(o);
                        setEditOpen(true);
                      }}
                      className="h-10 w-10 rounded-lg border border-border hover:bg-muted transition flex items-center justify-center"
                    >
                      <Pencil className="text-blue-400" size={18} />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      title="Eliminar"
                      onClick={() => handleDelete(o)}
                      className="h-10 w-10 rounded-lg border border-border hover:bg-muted transition flex items-center justify-center"
                    >
                      <Trash2 className="text-red-400" size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      </div>

      {/* Ticket modal */}
      <OrderTicketModal
        open={ticketOpen}
        order={selected}
        onClose={() => setTicketOpen(false)}
        onUpdated={load}
      />

      {/* Edit modal */}
      <EditOrderModal
        open={editOpen}
        order={editing}
        onClose={() => setEditOpen(false)}
        onUpdated={load}
      />
    </div>
  );
}
