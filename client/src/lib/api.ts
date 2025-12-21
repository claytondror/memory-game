import { API_BASE_URL } from "../const";

export const apiUrl = (path: string) => {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
