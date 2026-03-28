import { Product, User, SellRequest, Review } from '../types';

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

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async getReviews(productId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(review: Review): Promise<void> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Failed to create review');
  },

  async getWishlist(userId: string): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/wishlist/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async addToWishlist(userId: string, productId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
  },

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/wishlist/${userId}/${productId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
  },
};
