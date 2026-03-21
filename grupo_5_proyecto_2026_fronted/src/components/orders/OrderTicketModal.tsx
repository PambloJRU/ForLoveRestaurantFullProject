import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/services/orderService";
import { updateOrder, updateLocalTicketHeader } from "@/services/orderService";

type Props = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditOrderModal({ open, order, onClose, onUpdated }: Props) {
  const [number, setNumber] = useState<number>(1);
  const [date, setDate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !order) return;
    setNumber(Number(order.number ?? 1));
    setDate(String(order.date ?? ""));
  }, [open, order]);

  const handleSave = async () => {
    if (!order) return;
    if (!date) return toast.error("Fecha obligatoria");

    try {
      setSaving(true);
      await updateOrder(order.id, {
        number,
        date,
        idTable: Number(order.idTable ?? 0),
      });

      // opcional: actualizar ticket local (si guardás orderId)
      updateLocalTicketHeader(order.id, { orderNumber: number, date });

      toast.success("Orden actualizada");
      onClose();
      onUpdated();
    } catch (e: any) {
      toast.error(e?.response?.data?.value ?? "Error editando orden");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-black/60 backdrop-blur-md p-6">
        <h2 className="text-xl font-semibold">Editar orden</h2>
        <p className="text-sm text-muted-foreground mt-1">ID #{order.id}</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Número *</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">Fecha *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-black/30 px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
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
  );
}

