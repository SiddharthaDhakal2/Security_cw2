'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { getImageUrl } from '@/lib/getImageUrl';
import { getProducts, updateStock, Product } from '@/lib/api/products';
import { useToast } from '@/components/ui/toast';

export default function AdminInventory() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustQuantity, setAdjustQuantity] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProducts();
        // Sort by createdAt descending (latest first)
        const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProducts(sorted);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load products';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAdjust = async (productId: string, adjustment: number, isAdd: boolean) => {
    try {
      setIsUpdating(true);
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const newQuantity = Math.max(0, product.quantity + (isAdd ? adjustment : -adjustment));
      
      const updated = await updateStock(productId, newQuantity);
      
      setProducts(products.map(p => p._id === productId ? updated : p));
      setAdjustQuantity({ ...adjustQuantity, [productId]: '' });
      showToast('Stock updated successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const outOfStockCount = products.filter(p => p.availability === 'out-of-stock').length;
  const lowStockCount = products.filter(p => p.availability === 'low-stock').length;

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <p className="text-gray-600">Monitor and manage your product stock levels</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Low Stock</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-yellow-600 animate-pulse' : 'text-gray-900'}`}>{lowStockCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
            <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{outOfStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Stock Levels</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Current Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                      {product.category}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">
                        {product.quantity} {product.unit}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={
                        product.availability === 'in-stock' ? 'bg-green-100 text-green-800' :
                        product.availability === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {product.availability.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-20 h-8 text-sm"
                          value={adjustQuantity[product._id] || ''}
                          onChange={(e) => setAdjustQuantity({
                            ...adjustQuantity,
                            [product._id]: e.target.value
                          })}
                          disabled={isUpdating}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const qty = parseInt(adjustQuantity[product._id] || '0');
                            if (qty) handleAdjust(product._id, qty, true);
                          }}
                          disabled={!adjustQuantity[product._id] || isUpdating}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const qty = parseInt(adjustQuantity[product._id] || '0');
                            if (qty) handleAdjust(product._id, qty, false);
                          }}
                          disabled={!adjustQuantity[product._id] || isUpdating}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
