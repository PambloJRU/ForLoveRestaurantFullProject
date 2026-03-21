export interface Payment {
    id?:number | null;
    number: number;
    date?: string | null;
    isActive?: boolean | null;
    idOrder?: number | null;
    amount?: number | null;
}