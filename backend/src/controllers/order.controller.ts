import { OrderService } from "../services/order.service";
import { CreateOrderDTO, UpdateOrderStatusDTO } from "../dtos/order.dto";
import { Request, Response } from "express";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const parsedData = CreateOrderDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await orderService.createOrder(userId, parsedData.data);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      return res.status(200).json({
        success: true,
        message: "Order retrieved successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrdersByUserId(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const orders = await orderService.getOrdersByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getAllOrders();

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedData = UpdateOrderStatusDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const order = await orderService.updateOrderStatus(id, parsedData.data);

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await orderService.deleteOrder(id);

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const statusQuery = typeof status === "string" ? status : "";

      const orders = await orderService.getOrdersByStatus(statusQuery);

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
