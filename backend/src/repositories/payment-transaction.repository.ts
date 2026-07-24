import {
  IPaymentTransaction,
  PaymentTransactionModel,
} from "../models/payment-transaction.model";

export class PaymentTransactionRepository {
  async createTransaction(data: Partial<IPaymentTransaction>) {
    const transaction = new PaymentTransactionModel(data);
    return transaction.save();
  }

  async getAllTransactions() {
    return PaymentTransactionModel.find()
      .sort({ createdAt: -1 })
      .populate("orderId")
      .populate("userId", "name email phone");
  }
}
