import axios from "axios";
const apiUrl = import.meta.env.VITE_API;

const getToken = () => {
  return sessionStorage.getItem("token");
};
const api = axios.create({
  baseURL: `${apiUrl}/`,
  headers: {
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  },
});


export default api;
