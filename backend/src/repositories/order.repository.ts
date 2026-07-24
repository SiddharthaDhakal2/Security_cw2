import { OrderModel, IOrder } from "../models/order.model";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../dtos/order.dto";
import { ProductModel } from "../models/product.model";
import { HttpError } from "../errors/http-error";
import { calculateProductAvailability } from "../utils/product-availability";

interface CreateOrderOptions {
  paymentMethod?: "khalti" | "esewa";
  paymentStatus?: "unpaid" | "paid" | "failed";
  paymentPidx?: string;
}

export class OrderRepository {
  private async validateStock(items: CreateOrderDTO["items"]) {
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        throw new HttpError(404, `Product not found: ${item.productId}`);
      }

      if (product.quantity < item.quantity) {
        throw new HttpError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }
    }
  }

  private async decrementStock(items: CreateOrderDTO["items"]) {
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        throw new HttpError(404, `Product not found: ${item.productId}`);
      }

      if (product.quantity < item.quantity) {
        throw new HttpError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }

      const newQuantity = product.quantity - item.quantity;
      const availability = calculateProductAvailability(newQuantity);

      await ProductModel.findByIdAndUpdate(
        item.productId,
        {
          quantity: newQuantity,
          availability,
        },
        { new: true }
      );
    }
  }

  async createOrder(
    userId: string,
    data: CreateOrderDTO,
    options?: CreateOrderOptions
  ): Promise<IOrder> {
    // Validate stock without decrementing until payment success
    await this.validateStock(data.items);

    const order = new OrderModel({
      userId,
      ...data,
      paymentMethod: options?.paymentMethod,
      paymentStatus: options?.paymentStatus ?? "unpaid",
      paymentPidx: options?.paymentPidx,
    });
    return order.save();
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id).populate("items.productId");
  }

  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    return OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId");
  }

  async getAllOrders(): Promise<IOrder[]> {
    return OrderModel.find({ paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .populate("items.productId");
  }

  async getAllPaymentRecords(): Promise<IOrder[]> {
    return OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("items.productId");
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDTO): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(
      id,
      { status: data.status },
      { new: true }
    );
  }

  async deleteOrder(id: string): Promise<IOrder | null> {
    return OrderModel.findByIdAndDelete(id);
  }

  async getOrdersByStatus(status: string): Promise<IOrder[]> {
    return OrderModel.find({ status, paymentStatus: "paid" }).sort({ createdAt: -1 });
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
  ): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(orderId, data, { new: true });
  }

  async applyStockForOrder(orderId: string): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    if (order.stockApplied) {
      return;
    }

    const items = order.items.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    }));

    await this.decrementStock(items);
    await OrderModel.findByIdAndUpdate(orderId, { stockApplied: true });
  }
}
