export type Supplier = {
  id?: number;
  photo?: string;          // ruta  "/uploads/suppliers/..."
  name?: string;
  identification?: string;
  phone?: string;
  email?: string;
  isactive?: boolean;
};


export type SupplierFormData = {
  name: string;
  identification: string;
  phone: string;
  email: string;
  photoFile?: File | null;   
  photo?: string;            
};
