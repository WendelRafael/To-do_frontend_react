// services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Substitua pelo IP da sua máquina se estiver usando celular físico
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 5000,
});

// 🔹 Interceptor adiciona token automaticamente em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
