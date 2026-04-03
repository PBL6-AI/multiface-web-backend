export interface ApiResponse<TData> {
  success: true;
  data: TData;
  message?: string;
}

export type ApiSuccessResponse<TData> = ApiResponse<TData>;
