export interface Employee {
  id?: number;
  identification: string;
  name: string;
  lastNames: string;
  shift: "Diurno" | "Nocturno";
  salary: number | "";
  isActive: boolean;
}
