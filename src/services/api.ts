import { Product, User, SellRequest } from '../types';

const API_BASE = '/api';

export const api = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  async seedProducts(products: Product[]): Promise<void> {
    await fetch(`${API_BASE}/products/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
  },

  async getUser(uid: string): Promise<User | null> {
    const res = await fetch(`${API_BASE}/users/${uid}`);
    if (!res.ok) return null;
    return res.json();
  },

  async saveUser(user: User): Promise<void> {
    await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  },

  async getSellRequests(userId?: string): Promise<SellRequest[]> {
    const url = userId ? `${API_BASE}/sell-requests?userId=${userId}` : `${API_BASE}/sell-requests`;
    const res = await fetch(url);
    return res.json();
  },

  async createSellRequest(request: SellRequest): Promise<void> {
    await fetch(`${API_BASE}/sell-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateSellRequestStatus(id: string, status: string): Promise<void> {
    await fetch(`${API_BASE}/sell-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },
};
