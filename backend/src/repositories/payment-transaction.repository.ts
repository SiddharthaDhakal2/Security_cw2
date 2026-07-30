import {
  IPaymentTransaction,
  PaymentTransactionModel,
} from "../models/payment-transaction.model";
import { decryptSensitiveUserFields } from "../utils/encryption";

type PaymentTransactionRecord = Record<string, unknown>;

const isPopulatedUser = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value && typeof value === "object" && "email" in value);
};

export class PaymentTransactionRepository {
  async createTransaction(data: Partial<IPaymentTransaction>) {
    const transaction = new PaymentTransactionModel(data);
    return transaction.save();
  }

  async getAllTransactions(): Promise<PaymentTransactionRecord[]> {
    const transactions = await PaymentTransactionModel.find()
      .sort({ createdAt: -1 })
      .populate("orderId")
      .populate("userId", "name email phone");

    return transactions.map((transaction) => {
      const plainTransaction = (
        transaction.toObject ? transaction.toObject() : { ...transaction }
      ) as PaymentTransactionRecord;

      if (isPopulatedUser(plainTransaction.userId)) {
        plainTransaction.userId = decryptSensitiveUserFields(plainTransaction.userId);
      }

      return plainTransaction;
    });
  }
}
