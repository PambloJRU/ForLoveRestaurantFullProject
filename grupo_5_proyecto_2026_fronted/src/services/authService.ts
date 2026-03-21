import axios from "axios";

const API_URL = "http://localhost:5151/api/Access";

export interface LoginRequest {
  name: string;
  password: string;
}

interface LoginResponse {
  isSuccess: boolean;
  token: {
    result: string;
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<string> {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/login`,
      {
        Name: data.name,
        Password: data.password,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error("Credenciales inválidas");
    }

    return response.data.token.result;
  },
};
