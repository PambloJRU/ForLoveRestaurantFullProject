import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import type { Payment } from "@/types/Payment"; //  interfaz PaymentDTO
import { getAllPayments, deletePayment } from "@/services/paymentService";

// Helper para fecha 
const formatDate = (d: any) => {
  if (!d) return "-";
  if (typeof d === "string") return d.slice(0, 10);
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
};

const PaymentsPage = () => {
const navigate = useNavigate();
  const qc = useQueryClient();
  
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  
  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };
  
  // Estados para el Modal de Eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const { data = [], isLoading, isError, error } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: getAllPayments,
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    
    return data.filter((p) => 
      p.number.toString().includes(q) || 
      (p.idOrder?.toString() ?? "").includes(q)
    );
  }, [search, data]);

  // Mutación para Eliminar
  const del = useMutation({
    mutationFn: (id: number) => deletePayment(id),
    onSuccess: async (res: any) => {
      toast.success(res?.value ?? "Pago eliminado correctamente");
      await qc.invalidateQueries({ queryKey: ["payments"] });
      // Cerramos el modal tras el éxito
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Error eliminando pago");
      setShowDeleteModal(false);
    }
  });

  const handleEdit = (number: number) => {
    navigate(`/payments/edit/${number}`);
  };

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };
  return (
    <div className="min-h-screen flex text-foreground">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-playfair font-semibold flex items-center gap-3 text-white">
                <CreditCard className="h-8 w-8 text-primary" />
                Gestión de Pagos
              </h1>
              <p className="text-muted-foreground mt-2">
                Historial de transacciones y estados de pago.
              </p>
            </div>
          </div>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por # Pago o ID Orden..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {isLoading && (
            <div className="mt-6 text-muted-foreground animate-pulse">Cargando pagos...</div>
          )}

          {isError && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-900/10 p-4">
              <p className="text-red-400 font-semibold">Error cargando pagos</p>
              <p className="text-red-300/70 text-sm mt-1">
                {(error as any)?.message ?? "Error de conexión"}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-black/20">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-xs uppercase tracking-wider">
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="px-6 py-4"># Pago</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Orden Asociada</th>
                    {/*<th className="px-6 py-4">Estado</th>*/}
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.number} className="hover:bg-white/5 transition duration-150 border-t border-border">
                      
                      <td className="px-6 py-4 font-mono text-white font-medium">
                        #{p.number}
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(p.date)}
                      </td>

                      <td className="px-6 py-4">
                        {p.idOrder ? (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                             Orden #{p.idOrder}
                           </span>
                        ) : (
                           <span className="text-muted-foreground italic text-sm">Sin asignar</span>
                        )}
                      </td>

                      {/*<td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                            p.isActive 
                            ? "bg-green-500/10 text-green-400 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                            {p.isActive ? <CheckCircle className="h-3.5 w-3.5"/> : <XCircle className="h-3.5 w-3.5"/>}
                            <span>{p.isActive ? "Activo" : "Inactivo"}</span>
                        </div>
                      </td>*/}

                      <td className="px-6 py-4 text-emerald-400 font-semibold">
                          ₡ {p.amount?.toLocaleString("es-CR") ?? "0"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          {/* Se actualiza el botón de eliminar para abrir el modal */}
                          <button
                            onClick={() => handleDeleteClick(p)}
                            title="Eliminar"
                            className="hover:opacity-90 disabled:opacity-50"
                          >
                            <Trash2 className="h-5 w-5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        No se encontraron pagos con ese criterio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Modal de Eliminación Estilo Ingredientes --- */}
        {showDeleteModal && paymentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 text-foreground">
              <h2 className="text-xl font-semibold">
                Eliminar pago
              </h2>

              <p className="mt-3 text-muted-foreground">
                ¿Deseas eliminar el pago{" "}
                <span className="font-semibold text-foreground">
                  #{paymentToDelete.number}
                </span>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPaymentToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition"
                  disabled={del.isPending}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => del.mutate(paymentToDelete.id)}
                  disabled={del.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  {del.isPending ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
      </div>
    </div>
  );
};

export default PaymentsPage;
