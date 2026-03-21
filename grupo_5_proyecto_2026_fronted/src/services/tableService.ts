import axios from "axios";
import { Table } from "../types/Table";

const API_URL = "http://localhost:5151/api/Table";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getTables = async (): Promise<Table[]> => {
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

export const addTable = async (formData: FormData) => {
  const response = await axios.post(
    `${API_URL}/Add`,
    formData,
    getAuthHeaders()
  );
  return response.data;
};

export const editTable = async (id: number, formData: FormData) => {
  const response = await axios.put(
    `${API_URL}/Edit/${id}`,
    formData,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteTable = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/Delete/${id}`,
    getAuthHeaders()
  );
  return response.data;
};
