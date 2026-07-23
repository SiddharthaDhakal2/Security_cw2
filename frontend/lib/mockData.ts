export interface Product {
  id: string;
  name: string;
  category: 'vegetables' | 'fruits' | 'grains';
  price: number;
  unit: string;
  quantity: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  image: string;
  description: string;
  supplier: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'vegetables',
    price: 4.99,
    unit: 'kg',
    quantity: 150,
    availability: 'in-stock',
    image: 'https://via.placeholder.com/400?text=Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides',
    supplier: 'Green Valley Farms'
  },
  {
    id: '2',
    name: 'Fresh Carrots',
    category: 'vegetables',
    price: 2.99,
    unit: 'kg',
    quantity: 30,
    availability: 'low-stock',
    image: 'https://via.placeholder.com/400?text=Carrots',
    description: 'Crisp and sweet carrots perfect for cooking',
    supplier: 'Sunny Fields'
  },
  {
    id: '3',
    name: 'Apples',
    category: 'fruits',
    price: 5.99,
    unit: 'kg',
    quantity: 200,
    availability: 'in-stock',
    image: 'https://via.placeholder.com/400?text=Apples',
    description: 'Red, crisp apples straight from the orchard',
    supplier: 'Mountain Ridge Orchard'
  },
  {
    id: '4',
    name: 'Wheat Grain',
    category: 'grains',
    price: 0.50,
    unit: 'kg',
    quantity: 0,
    availability: 'out-of-stock',
    image: 'https://via.placeholder.com/400?text=Wheat',
    description: 'Premium wheat grain for milling',
    supplier: 'Golden Harvest'
  },
  {
    id: '5',
    name: 'Spinach',
    category: 'vegetables',
    price: 3.99,
    unit: 'bunch',
    quantity: 45,
    availability: 'in-stock',
    image: 'https://via.placeholder.com/400?text=Spinach',
    description: 'Fresh green spinach leaves',
    supplier: 'Green Valley Farms'
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '555-0101',
    deliveryAddress: '123 Main St, Springfield, IL 62701',
    date: '2024-02-10',
    status: 'delivered',
    items: [
      { product: products[0], quantity: 2 },
      { product: products[2], quantity: 1 }
    ],
    total: 15.97
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '555-0102',
    deliveryAddress: '456 Oak Ave, Springfield, IL 62702',
    date: '2024-02-12',
    status: 'shipped',
    items: [
      { product: products[1], quantity: 3 },
      { product: products[4], quantity: 2 }
    ],
    total: 17.97
  },
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    customerPhone: '555-0103',
    deliveryAddress: '789 Pine Rd, Springfield, IL 62703',
    date: '2024-02-14',
    status: 'processing',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 2 },
      { product: products[4], quantity: 1 }
    ],
    total: 19.96
  },
  {
    id: 'ORD-004',
    customerName: 'Alice Brown',
    customerEmail: 'alice@example.com',
    customerPhone: '555-0104',
    deliveryAddress: '321 Elm St, Springfield, IL 62704',
    date: '2024-02-14',
    status: 'pending',
    items: [
      { product: products[2], quantity: 3 }
    ],
    total: 17.97
  },
  {
    id: 'ORD-005',
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie@example.com',
    customerPhone: '555-0105',
    deliveryAddress: '654 Maple Dr, Springfield, IL 62705',
    date: '2024-02-13',
    status: 'delivered',
    items: [
      { product: products[1], quantity: 2 },
      { product: products[4], quantity: 1 }
    ],
    total: 10.97
  }
];
