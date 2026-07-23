import { OrderRepository } from "../repositories/order.repository";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../dtos/order.dto";
import { HttpError } from "../errors/http-error";

const orderRepository = new OrderRepository();

export class OrderService {
  async createOrder(
    userId: string,
    data: CreateOrderDTO,
    options?: {
      paymentMethod?: "khalti" | "esewa";
      paymentStatus?: "unpaid" | "paid" | "failed";
      paymentPidx?: string;
    }
  ) {
    return orderRepository.createOrder(userId, data, options);
  }

  async getOrderById(id: string) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }
    return order;
  }

  async getOrdersByUserId(userId: string) {
    return orderRepository.getOrdersByUserId(userId);
  }

  async getAllOrders() {
    return orderRepository.getAllOrders();
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDTO) {
    const order = await orderRepository.updateOrderStatus(id, data);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }
    return order;
  }

  async deleteOrder(id: string) {
    const order = await orderRepository.deleteOrder(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }
    return order;
  }

  async getOrdersByStatus(status: string) {
    return orderRepository.getOrdersByStatus(status);
  }

  async updatePaymentInfo(
    orderId: string,
    data: {
      paymentMethod?: "khalti" | "esewa";
      paymentStatus?: "unpaid" | "paid" | "failed";
      paymentPidx?: string;
      paymentReference?: string;
      paidAt?: Date;
      status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    }
  ) {
    const existing = await orderRepository.getOrderById(orderId);
    if (!existing) {
      throw new HttpError(404, "Order not found");
    }

    const wasPaid = existing.paymentStatus === "paid";
    const updated = await orderRepository.updatePaymentInfo(orderId, data);
    if (!updated) {
      throw new HttpError(404, "Order not found");
    }

    if (data.paymentStatus === "paid" && !wasPaid) {
      await orderRepository.applyStockForOrder(orderId);
    }

    return updated;
  }
}
