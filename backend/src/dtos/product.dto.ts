import { z } from "zod";

export const CreateProductDTO = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["vegetables", "fruits", "grains"]),
  price: z.number().min(0, "Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  image: z.string().min(1, "Image is required"),
  supplier: z.string().min(1, "Supplier is required"),
  farm: z.string().min(1, "Farm is required"),
  availability: z.enum(["in-stock", "low-stock", "out-of-stock"]).optional(),
});

export type CreateProductDTO = z.infer<typeof CreateProductDTO>;

export const UpdateProductDTO = CreateProductDTO.partial();
export type UpdateProductDTO = z.infer<typeof UpdateProductDTO>;
