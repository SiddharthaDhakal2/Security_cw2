import { ProductService } from "../services/product.service";
import { CreateProductDTO } from "../dtos/product.dto";
import { Request, Response } from "express";

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      // Attach image path to req.body before validation
      if (req.file) {
        req.body.image = `/uploads/admin/${req.file.filename}`;
      }

      // Convert numeric fields from string to number (since multipart/form-data sends all as strings)
      if (typeof req.body.price === 'string') req.body.price = Number(req.body.price);
      if (typeof req.body.quantity === 'string') req.body.quantity = Number(req.body.quantity);

      const parsedData = CreateProductDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const productData = parsedData.data;
      const product = await productService.createProduct(productData);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();

      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      return res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const products = await productService.getProductsByCategory(category);

      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let updateData = req.body;
      if (req.file) {
        updateData = { ...updateData, image: `/uploads/admin/${req.file.filename}` };
      }

      const product = await productService.updateProduct(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await productService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const searchQuery = typeof query === "string" ? query : "";

      const products = await productService.searchProducts(searchQuery);

      return res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== "number") {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a number",
        });
      }

      const product = await productService.updateStock(id, quantity);

      return res.status(200).json({
        success: true,
        message: "Stock updated successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
