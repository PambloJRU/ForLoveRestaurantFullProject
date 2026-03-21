import { api } from "./api";

export interface UserDTO {
  id?: number;
  name: string;
  password: string;
  idEmploye: number;
  idRol: number;
}

export const userService = {
  // GET api/User/List
  async list() {
    const res = await api.get("/User/List");
    return res.data.value;
  },

async create(data: UserDTO) {
  const res = await api.post("/Access/Register", {
    Name: data.name,
    Password: data.password,
    IdEmploye: data.idEmploye,
    IdRol: data.idRol,
  });

  return res.data;
},


  // PUT api/User/Edit/{id}
  async edit(id: number, data: UserDTO) {
    return api.put(`/User/Edit/${id}`, {
      Name: data.name,
      Password: data.password,
      IdEmploye: data.idEmploye,
      IdRol: data.idRol,
    });
  },


  // PUT api/User/Delete/{id}
  async delete(id: number) {
    return api.put(`/User/Delete/${id}`);
  },
};
