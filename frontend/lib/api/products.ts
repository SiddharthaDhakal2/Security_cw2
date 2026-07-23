import { AxiosError } from "axios";
import axiosInstance from "./axios";

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: "vegetables" | "fruits" | "grains";
  price: number;
  unit: string;
  quantity: number;
  image: string;
  supplier: string;
  farm: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  success: boolean;
  data: Product[];
  message: string;
}

export interface GetProductResponse {
  success: boolean;
  data: Product;
  message: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const res = await axiosInstance.get<GetProductsResponse>("/api/products");
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch products";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const res = await axiosInstance.get<GetProductResponse>(`/api/products/${id}`);
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch product";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const res = await axiosInstance.get<GetProductsResponse>("/api/products/search", {
      params: { query },
    });
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to search products";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  try {
    const res = await axiosInstance.get<GetProductsResponse>(
      `/api/products/category/${category}`
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch products by category";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const createProduct = async (
  data: FormData
): Promise<Product> => {
  try {
    const res = await axiosInstance.post<GetProductResponse>("/api/products", data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to create product";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateProductAPI = async (
  id: string,
  data: FormData
): Promise<Product> => {
  try {
    const res = await axiosInstance.put<GetProductResponse>(
      `/api/products/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to update product";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/products/${id}`);
  } catch (err: unknown) {
    let message = "Failed to delete product";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const updateStock = async (
  id: string,
  quantity: number
): Promise<Product> => {
  try {
    const res = await axiosInstance.patch<GetProductResponse>(
      `/api/products/${id}/stock`,
      { quantity }
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to update stock";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
