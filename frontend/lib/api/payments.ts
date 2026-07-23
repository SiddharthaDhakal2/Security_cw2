import { AxiosError } from "axios";
import axiosInstance from "./axios";
import { CreateOrderData } from "./orders";

export interface InitiateKhaltiResponse {
  orderId: string;
  pidx: string;
  paymentUrl: string;
}

export interface VerifyKhaltiResponse {
  orderId: string;
  paid: boolean;
  status: string;
}

export const initiateKhaltiPayment = async (
  data: CreateOrderData
): Promise<InitiateKhaltiResponse> => {
  try {
    const res = await axiosInstance.post<{ success: boolean; data: InitiateKhaltiResponse }>(
      "/api/payments/khalti/initiate",
      data
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to initiate Khalti payment";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const verifyKhaltiPayment = async (
  pidx: string,
  orderId?: string
): Promise<VerifyKhaltiResponse> => {
  try {
    const res = await axiosInstance.post<{ success: boolean; data: VerifyKhaltiResponse }>(
      "/api/payments/khalti/verify",
      { pidx, orderId }
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to verify Khalti payment";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
