import { api } from "./api";
import type { Ingredient } from "@/types/Ingredients";

export const FILES_BASE_URL = "http://localhost:5151";

export const ingredientService = {
  async list(): Promise<Ingredient[]> {
    const res = await api.get("/Ingredient/List");
    return res.data.value;
  },

  async getById(id: number): Promise<Ingredient> {
    const list = await this.list();
    const ingredient = list.find(i => i.id === id);

    if (!ingredient) {
      throw new Error("Ingrediente no encontrado");
    }

    return ingredient;
  },

  async create(formData: FormData) {
    await api.post("/Ingredient/Add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async update(id: number, formData: FormData) {
    await api.put(`/Ingredient/Edit/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async delete(id: number) {
    await api.delete(`/Ingredient/Delete/${id}`);
  },
};
