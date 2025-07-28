import axios, {type AxiosRequestConfig, type AxiosResponse } from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const customAxios = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axios({
    baseURL,
    ...config,
  });
  return response.data;
};