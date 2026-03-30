import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

import { instance } from './axiosInstance.ts';

export const axiosMutator = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  return instance({ ...config, ...options }).then((response: AxiosResponse<T>) => response.data);
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
