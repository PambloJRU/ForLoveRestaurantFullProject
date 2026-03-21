import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import MenuItemForm from "@/components/menuitems/MenuItemForm";
import type { MenuItemFormData } from "@/types/MenuItem";
import { addMenuItem, listMenuItems } from "@/services/menuItem";

export default function CreateMenuItem() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data: existingItems = [] } = useQuery({
    queryKey: ["menuitems"],
    queryFn: listMenuItems,
    retry: false,
  });

  const handleSubmit = async (data: MenuItemFormData) => {
    try {
      setSaving(true);
      const res: any = await addMenuItem(data);
      toast.success(res?.value ?? "Platillo registrado exitosamente");
      navigate("/menuitems"); 
    } catch (e: any) {
      toast.error(e?.message ?? "Error registrando platillo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MenuItemForm
      existingItems={existingItems}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isSubmitting={saving}
    />
  );
}
