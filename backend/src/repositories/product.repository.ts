import { ProductModel, IProduct } from "../models/product.model";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import {
  calculateProductAvailability,
  ProductAvailability,
} from "../utils/product-availability";

export class ProductRepository {
  private syncAvailability(product: IProduct): IProduct {
    product.availability = calculateProductAvailability(product.quantity);
    return product;
  }

  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    const availability = calculateProductAvailability(data.quantity);
    const product = new ProductModel({ ...data, availability });
    return product.save();
  }

  async getAllProducts(): Promise<IProduct[]> {
    const products = await ProductModel.find();
    return products.map((product) => this.syncAvailability(product));
  }

  async getProductById(id: string): Promise<IProduct | null> {
    const product = await ProductModel.findById(id);
    return product ? this.syncAvailability(product) : null;
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    const products = await ProductModel.find({ category });
    return products.map((product) => this.syncAvailability(product));
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct | null> {
    const updatePayload: UpdateProductDTO = { ...data };

    if (typeof updatePayload.quantity === "number") {
      updatePayload.availability = calculateProductAvailability(updatePayload.quantity);
    } else {
      delete updatePayload.availability;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updatePayload, { new: true });
    return updatedProduct ? this.syncAvailability(updatedProduct) : null;
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return ProductModel.findByIdAndDelete(id);
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    const products = await ProductModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { farm: { $regex: query, $options: "i" } },
      ],
    });

    return products.map((product) => this.syncAvailability(product));
  }

  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    const product = await ProductModel.findById(id);
    if (!product) return null;

    const availability: ProductAvailability = calculateProductAvailability(quantity);

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { quantity, availability },
      { new: true }
    );

    return updatedProduct ? this.syncAvailability(updatedProduct) : null;
  }
}
