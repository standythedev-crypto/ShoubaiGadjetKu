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
    const url = new URL(userId ? `${API_BASE}/sell-requests` : `${API_BASE}/sell-requests`, window.location.origin);
    if (userId) url.searchParams.append('userId', userId);
    url.searchParams.append('_t', Date.now().toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch sell requests');
    return res.json();
  },

  async createSellRequest(request: SellRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/sell-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to create sell request');
  },

  async updateSellRequestStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sell-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update sell request status');
  },
};
