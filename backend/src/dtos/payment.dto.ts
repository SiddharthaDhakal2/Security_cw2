import { z } from "zod";
import { CreateOrderDTO } from "./order.dto";

export const InitiateKhaltiPaymentDTO = CreateOrderDTO;

export type InitiateKhaltiPaymentDTO = z.infer<typeof InitiateKhaltiPaymentDTO>;

export const VerifyKhaltiPaymentDTO = z.object({
  pidx: z.string().min(1, "pidx is required"),
  orderId: z.string().optional(),
});

export type VerifyKhaltiPaymentDTO = z.infer<typeof VerifyKhaltiPaymentDTO>;
