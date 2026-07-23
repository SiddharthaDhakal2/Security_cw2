
  'use client';

  import { useState, useEffect } from 'react';
  import { Plus, Edit, Trash2 } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardHeader } from '@/components/ui/card';
  import { Input, Label } from '@/components/ui/input';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  import { Textarea } from '@/components/ui/textarea';
  import { Badge } from '@/components/ui/badge';
  import { ImageWithFallback } from '@/components/ImageWithFallback';
  import { getProducts, createProduct, updateProductAPI, deleteProduct as deleteProductAPI, Product } from '@/lib/api/products';
  import { useToast } from '@/components/ui/toast';
  import ConfirmDialog from '@/components/ConfirmDialog';
  import { getImageUrl } from '@/lib/getImageUrl';


export default function AdminProducts() {
  const { showToast } = useToast();
    const handleAdd = () => {
      setEditingProduct(null);
      setImagePreview('');
      setFormData({
        name: '',
        category: 'vegetables',
        price: '',
        unit: '',
        quantity: '',
        availability: 'in-stock',
        description: '',
        supplier: '',
        farm: '',
        image: ''
      });
      setIsDialogOpen(true);
    };
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });
  const [formData, setFormData] = useState<{
    name: string;
    category: Product['category'];
    price: string;
    unit: string;
    quantity: string;
    availability: Product['availability'];
    description: string;
    supplier: string;
    farm: string;
    image: string | File;
  }>({
    name: '',
    category: 'vegetables',
    price: '',
    unit: '',
    quantity: '',
    availability: 'in-stock',
    description: '',
    supplier: '',
    farm: '',
    image: ''
  });

  // Fetch products on mount
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.image);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      quantity: product.quantity.toString(),
      availability: product.availability,
      description: product.description,
      supplier: product.supplier,
      farm: product.farm,
      image: product.image
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ open: true, productId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.productId) return;
    
    try {
      await deleteProductAPI(deleteConfirm.productId);
      setProducts(products.filter(p => p._id !== deleteConfirm.productId));
      showToast('Product deleted successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setDeleteConfirm({ open: false, productId: null });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Enforce image selection on add
      if (!formData.name || !formData.price || !formData.unit || !formData.quantity || !formData.supplier || !formData.farm) {
        showToast('Please fill in all required fields', 'warning');
        setIsSubmitting(false);
        return;
      }
      if (!editingProduct && !(formData.image instanceof File)) {
        showToast('Please select an image for the product', 'warning');
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('supplier', formData.supplier);
      formDataToSend.append('farm', formData.farm);
      formDataToSend.append('availability', formData.availability);
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      if (editingProduct) {
        await updateProductAPI(editingProduct._id, formDataToSend);
        const freshProducts = await getProducts();
        setProducts(freshProducts);
        showToast('Product updated successfully', 'success');
      } else {
        await createProduct(formDataToSend);
        const freshProducts = await getProducts();
        setProducts(freshProducts);
        showToast('Product created successfully', 'success');
      }

      handleDialogChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      showToast(`Error: ${msg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData({
        name: '',
        category: 'vegetables',
        price: '',
        unit: '',
        quantity: '',
        availability: 'in-stock',
        description: '',
        supplier: '',
        farm: '',
        image: ''
      });
      setImagePreview('');
      setEditingProduct(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Add, edit, or remove products from your catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    placeholder="e.g., kg, lb"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="farm">Farm *</Label>
                  <Input
                    id="farm"
                    value={formData.farm}
                    onChange={(e) => handleChange('farm', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select value={formData.availability} onValueChange={(value) => handleChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Product Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </Button>
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">All Products ({products.length})</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={getImageUrl(product.image) + (product.updatedAt ? `?v=${new Date(product.updatedAt).getTime()}` : '')}
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
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      Rs {product.price} / {product.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {product.quantity} {product.unit}
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, productId: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
