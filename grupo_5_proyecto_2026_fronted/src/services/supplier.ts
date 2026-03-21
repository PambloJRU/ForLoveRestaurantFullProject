import { api } from "./api";
import type { Supplier, SupplierFormData } from "@/types/Supplier";

const getHost = () => api.defaults.baseURL?.replace(/\/api\/?$/, "") ?? "";

export const supplierPhotoUrl = (photo?: string) => {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  return `${getHost()}${photo}`;
};


export const listSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await api.get("/Supplier/List");
  return data?.value ?? [];
};

export const addSupplier = async (payload: SupplierFormData) => {
  const fd = new FormData();
  fd.append("Name", payload.name);
  fd.append("Identification", payload.identification);
  fd.append("Phone", payload.phone);
  fd.append("Email", payload.email);

  if (payload.photoFile) fd.append("Photo", payload.photoFile);

  const { data } = await api.post("/Supplier/Add", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
export const editSupplier = async (id: number, payload: SupplierFormData) => {
  const fd = new FormData();
  fd.append("Name", payload.name);
  fd.append("Identification", payload.identification);
  fd.append("Phone", payload.phone);
  fd.append("Email", payload.email);

   if (payload.photoFile) fd.append("Photo", payload.photoFile);

  const { data } = await api.put(`/Supplier/Update/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteSupplier = async (id: number) => {
  const { data } = await api.delete(`/Supplier/Delete/${id}`);
  return data;
};
