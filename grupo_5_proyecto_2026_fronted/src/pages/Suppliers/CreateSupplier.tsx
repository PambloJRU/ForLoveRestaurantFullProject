import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierForm from "@/components/suppliers/SupplierForm";
import type { SupplierFormData } from "@/types/Supplier";
import { addSupplier } from "@/services/supplier";
import { toast } from "sonner";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      setSaving(true);
      const res: any = await addSupplier(data); 
      toast.success(res?.value ?? "Proveedor registrado correctamente");
      navigate("/suppliers");
    } catch (e: any) {
      toast.error(e?.message ?? "Error registrando proveedor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SupplierForm
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isSubmitting={saving}
    />
  );
};

export default CreateSupplier;
