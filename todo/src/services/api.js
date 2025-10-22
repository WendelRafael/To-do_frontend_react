import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.10:8000'; // emulador Android
// ou use: const API_BASE_URL = 'http://192.168.0.10:8000'; // celular real

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('@token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;
