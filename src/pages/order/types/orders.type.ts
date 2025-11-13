export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  amount: number;
  currency: string;
  points: number;
}

export interface OrderItem {
  id: string;
  qty: number;
  status: string;
  product: Product;
}

export interface Order {
  id: string;
  orderNo: string;
  status: string;
  paymentType: string;
  orderCreatedAt: string;
  customer: Customer;
  metadata?: any;
  orderItems: OrderItem[];
}
