import axios from "axios";
import { Payment } from "@/types/Payment";

const API_URL = "http://localhost:5151/api/Payment";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axios.get(`${API_URL}/List`, getAuthHeaders());
    return response.data?.value ?? [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const deletePayment = async (id: number) => {
  try{
    const respone = await axios.delete(`${API_URL}/Delete/${id}`,
      getAuthHeaders()
    );
  }catch(error: any){
    if (error.response?.status === 404) {
      return [];
    }
    console.log(error);
    throw error;
  }
}

export const createPayment = async (payment: Payment) => {
  try {
    const formData = new FormData();
    formData.append("Number", String(payment.number));
    formData.append("IdOrder", String(payment.idOrder));

    if (payment.date) {
      formData.append("Date", payment.date);
    }

    if (typeof payment.isActive !== "undefined") {
      formData.append("IsActive", String(payment.isActive));
    }

    if (payment.amount !== undefined) {
      formData.append("Amount", String(payment.amount));
    }

    const response = await axios.post(`${API_URL}/Add`, formData, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    console.log(error);
    throw error;
  }
};

