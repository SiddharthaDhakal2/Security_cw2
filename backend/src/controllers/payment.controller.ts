import { Request, Response } from "express";
import { InitiateKhaltiPaymentDTO, VerifyKhaltiPaymentDTO } from "../dtos/payment.dto";
import { OrderService } from "../services/order.service";
import { KhaltiService } from "../services/khalti.service";
import { HttpError } from "../errors/http-error";

const orderService = new OrderService();
const khaltiService = new KhaltiService();

export class PaymentController {
  async initiateKhaltiPayment(req: Request, res: Response) {
    try {
      const parsedData = InitiateKhaltiPaymentDTO.safeParse(req.body);

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

      const order = await orderService.createOrder(userId, parsedData.data, {
        paymentMethod: "khalti",
        paymentStatus: "unpaid",
      });

      const payment = await khaltiService.initiatePayment(order);

      await orderService.updatePaymentInfo(order._id.toString(), {
        paymentPidx: payment.pidx,
        paymentMethod: "khalti",
        paymentStatus: "unpaid",
      });

      return res.status(201).json({
        success: true,
        message: "Khalti payment initiated",
        data: {
          orderId: order._id,
          pidx: payment.pidx,
          paymentUrl: payment.payment_url,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verifyKhaltiPayment(req: Request, res: Response) {
    try {
      const parsedData = VerifyKhaltiPaymentDTO.safeParse(req.body);

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

      const lookup = await khaltiService.lookupPayment(parsedData.data.pidx);
      const orderId = parsedData.data.orderId || lookup.purchase_order_id;

      if (!orderId) {
        throw new HttpError(400, "Order id missing for payment verification");
      }

      const order = await orderService.getOrderById(orderId);
      if (order.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const isPaid = lookup.status === "Completed";

      await orderService.updatePaymentInfo(orderId, {
        paymentStatus: isPaid ? "paid" : "failed",
        paymentMethod: "khalti",
        paymentReference: lookup.transaction_id,
        paidAt: isPaid ? new Date() : undefined,
        status: isPaid ? "processing" : order.status,
      });

      return res.status(200).json({
        success: true,
        message: isPaid ? "Payment verified" : "Payment not completed",
        data: {
          orderId,
          paid: isPaid,
          status: lookup.status,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
