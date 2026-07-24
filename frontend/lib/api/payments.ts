import { AxiosError } from "axios";
import axiosInstance from "./axios";
import { CreateOrderData, Order } from "./orders";

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

export interface PaymentTransaction {
  _id: string;
  orderId: Order | string;
  userId:
    | {
        _id: string;
        name?: string;
        email?: string;
        phone?: string;
      }
    | string;
  paymentMethod: "khalti";
  pidx?: string;
  transactionId?: string;
  amount: number;
  status: "initiated" | "paid" | "failed" | "duplicate" | "invalid";
  khaltiStatus?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentsResponse {
  payments: Order[];
  transactions: PaymentTransaction[];
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

export const retryKhaltiPayment = async (
  orderId: string
): Promise<InitiateKhaltiResponse> => {
  try {
    const res = await axiosInstance.post<{ success: boolean; data: InitiateKhaltiResponse }>(
      `/api/payments/khalti/retry/${orderId}`
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to retry Khalti payment";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getAdminPayments = async (): Promise<AdminPaymentsResponse> => {
  try {
    const res = await axiosInstance.get<{ success: boolean; data: AdminPaymentsResponse }>(
      "/api/payments/admin"
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch payment records";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
