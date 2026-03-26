export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specs: {
    [key: string]: string;
  };
  condition: 'Excellent' | 'Good' | 'Fair';
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SellRequest {
  id: string;
  userId: string;
  userName: string;
  deviceName: string;
  category: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  estimatedPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  image?: string;
}

export interface SaleData {
  date: string;
  sales: number;
  revenue: number;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  photoURL?: string;
}
