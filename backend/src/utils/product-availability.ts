export type ProductAvailability = "in-stock" | "low-stock" | "out-of-stock";

export const LOW_STOCK_THRESHOLD = 49;

export const calculateProductAvailability = (
  quantity: number
): ProductAvailability => {
  if (quantity <= 0) {
    return "out-of-stock";
  }

  if (quantity <= LOW_STOCK_THRESHOLD) {
    return "low-stock";
  }

  return "in-stock";
};
