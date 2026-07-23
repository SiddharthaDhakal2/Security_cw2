import { AxiosError } from "axios";
import axiosInstance from "./axios";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod?: "khalti" | "esewa";
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentReference?: string;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
  message: string;
}

export interface GetOrderResponse {
  success: boolean;
  data: Order;
  message: string;
}

export interface GetOrdersResponse {
  success: boolean;
  data: Order[];
  message: string;
}

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  try {
    const res = await axiosInstance.post<CreateOrderResponse>("/api/orders", data);
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to create order";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getMyOrders = async (): Promise<Order[]> => {
  try {
    const res = await axiosInstance.get<GetOrdersResponse>("/api/orders/my-orders");
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch orders";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const res = await axiosInstance.get<GetOrderResponse>(`/api/orders/${id}`);
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch order";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const res = await axiosInstance.get<GetOrdersResponse>("/api/orders");
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch orders";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"]
): Promise<Order> => {
  try {
    const res = await axiosInstance.patch<GetOrderResponse>(
      `/api/orders/${id}/status`,
      { status }
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to update order status";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/orders/${id}`);
  } catch (err: unknown) {
    let message = "Failed to delete order";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getOrdersByStatus = async (
  status: Order["status"]
): Promise<Order[]> => {
  try {
    const res = await axiosInstance.get<GetOrdersResponse>("/api/orders", {
      params: { status },
    });
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch orders";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
