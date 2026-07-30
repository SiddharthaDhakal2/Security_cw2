import { ProductRepository } from "../repositories/product.repository";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { HttpError } from "../errors/http-error";
import { IProduct } from "../models/product.model";

const productRepository = new ProductRepository();

export class ProductService {
  async createProduct(data: CreateProductDTO) {
    return productRepository.createProduct(data);
  }

  async getAllProducts() {
    return productRepository.getAllProducts();
  }

  async getProductById(id: string) {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return product;
  }

  async getProductsByCategory(category: string) {
    const allowedCategories: IProduct["category"][] = ["vegetables", "fruits", "grains"];

    if (!allowedCategories.includes(category as IProduct["category"])) {
      throw new HttpError(400, "Invalid product category");
    }

    return productRepository.getProductsByCategory(category as IProduct["category"]);
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await productRepository.updateProduct(id, data);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return product;
  }

  async deleteProduct(id: string) {
    const product = await productRepository.deleteProduct(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return product;
  }

  async searchProducts(query: string) {
    if (!query.trim()) {
      return this.getAllProducts();
    }
    return productRepository.searchProducts(query);
  }

  async updateStock(id: string, quantity: number) {
    const product = await productRepository.updateStock(id, quantity);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return product;
  }
}
