import { Request, Response } from "express";
import { InitiateKhaltiPaymentDTO, VerifyKhaltiPaymentDTO } from "../dtos/payment.dto";
import { OrderService } from "../services/order.service";
import { KhaltiService } from "../services/khalti.service";
import { HttpError } from "../errors/http-error";
import { PaymentTransactionRepository } from "../repositories/payment-transaction.repository";

const orderService = new OrderService();
const khaltiService = new KhaltiService();
const paymentTransactionRepository = new PaymentTransactionRepository();

const expectedKhaltiAmount = (amount: number) => Math.round(amount * 100);

const getLookupAmount = (lookup: { total_amount?: number; amount?: number }) =>
  lookup.total_amount ?? lookup.amount;

export class PaymentController {
  async getAdminPayments(_req: Request, res: Response) {
    try {
      const [payments, transactions] = await Promise.all([
        orderService.getAllPaymentRecords(),
        paymentTransactionRepository.getAllTransactions(),
      ]);

      return res.status(200).json({
        success: true,
        message: "Payment records fetched",
        data: {
          payments,
          transactions,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

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

      await paymentTransactionRepository.createTransaction({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: "khalti",
        pidx: payment.pidx,
        amount: order.total,
        status: "initiated",
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

  async retryKhaltiPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await orderService.getOrderById(req.params.orderId);
      if (order.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (order.paymentStatus === "paid") {
        throw new HttpError(409, "This order is already paid");
      }

      const payment = await khaltiService.initiatePayment(order);

      await orderService.updatePaymentInfo(order._id.toString(), {
        paymentPidx: payment.pidx,
        paymentMethod: "khalti",
        paymentStatus: "unpaid",
      });

      await paymentTransactionRepository.createTransaction({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: "khalti",
        pidx: payment.pidx,
        amount: order.total,
        status: "initiated",
      });

      return res.status(200).json({
        success: true,
        message: "Khalti payment retry initiated",
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

      if (order.paymentPidx && order.paymentPidx !== parsedData.data.pidx) {
        await paymentTransactionRepository.createTransaction({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: "khalti",
          pidx: parsedData.data.pidx,
          amount: order.total,
          status: "invalid",
          khaltiStatus: lookup.status,
          failureReason: "Payment PIDX does not match the latest order payment attempt",
          rawResponse: lookup as any,
        });
        throw new HttpError(400, "Payment reference does not match this order");
      }

      if (lookup.purchase_order_id && lookup.purchase_order_id !== order._id.toString()) {
        await paymentTransactionRepository.createTransaction({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: "khalti",
          pidx: parsedData.data.pidx,
          amount: order.total,
          status: "invalid",
          khaltiStatus: lookup.status,
          failureReason: "Khalti purchase order id does not match order id",
          rawResponse: lookup as any,
        });
        throw new HttpError(400, "Khalti order reference does not match this order");
      }

      const khaltiAmount = getLookupAmount(lookup);
      if (typeof khaltiAmount === "number" && khaltiAmount !== expectedKhaltiAmount(order.total)) {
        await paymentTransactionRepository.createTransaction({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: "khalti",
          pidx: parsedData.data.pidx,
          amount: order.total,
          status: "invalid",
          khaltiStatus: lookup.status,
          failureReason: "Khalti amount does not match order total",
          rawResponse: lookup as any,
        });
        throw new HttpError(400, "Khalti payment amount does not match this order");
      }

      const isPaid = lookup.status === "Completed";

      if (isPaid && order.paymentStatus === "paid") {
        await paymentTransactionRepository.createTransaction({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: "khalti",
          pidx: parsedData.data.pidx,
          transactionId: lookup.transaction_id,
          amount: order.total,
          status: "duplicate",
          khaltiStatus: lookup.status,
          failureReason: "Order was already paid",
          rawResponse: lookup as any,
        });

        return res.status(200).json({
          success: true,
          message: "Payment was already verified",
          data: {
            orderId,
            paid: true,
            status: lookup.status,
          },
        });
      }

      await orderService.updatePaymentInfo(orderId, {
        paymentStatus: isPaid ? "paid" : "failed",
        paymentMethod: "khalti",
        paymentReference: lookup.transaction_id,
        paidAt: isPaid ? new Date() : undefined,
        status: isPaid ? "processing" : order.status,
      });

      await paymentTransactionRepository.createTransaction({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: "khalti",
        pidx: parsedData.data.pidx,
        transactionId: lookup.transaction_id,
        amount: order.total,
        status: isPaid ? "paid" : "failed",
        khaltiStatus: lookup.status,
        failureReason: isPaid ? undefined : `Khalti status: ${lookup.status}`,
        rawResponse: lookup as any,
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
