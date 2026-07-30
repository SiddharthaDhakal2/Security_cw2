import {
  IPaymentTransaction,
  PaymentTransactionModel,
} from "../models/payment-transaction.model";
import { decryptSensitiveUserFields } from "../utils/encryption";

export class PaymentTransactionRepository {
  async createTransaction(data: Partial<IPaymentTransaction>) {
    const transaction = new PaymentTransactionModel(data);
    return transaction.save();
  }

  async getAllTransactions() {
    const transactions = await PaymentTransactionModel.find()
      .sort({ createdAt: -1 })
      .populate("orderId")
      .populate("userId", "name email phone");

    return transactions.map((transaction) => {
      const plainTransaction = transaction.toObject ? transaction.toObject() : { ...transaction };

      if (plainTransaction.userId && typeof plainTransaction.userId === "object") {
        plainTransaction.userId = decryptSensitiveUserFields(plainTransaction.userId);
      }

      return plainTransaction;
    });
  }
}
