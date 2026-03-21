export type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  photo?: string | null;
  isactive?: boolean | null;
};

export type MenuItemFormData = {
  name: string;
  description: string;
  price: string;
  isactive: boolean;
  photoFile: File | null;
};
