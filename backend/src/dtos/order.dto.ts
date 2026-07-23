import { z } from "zod";

export const CreateOrderDTO = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      total: z.number(),
    })
  ),
  total: z.number(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderDTO>;

export const UpdateOrderStatusDTO = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusDTO>;
