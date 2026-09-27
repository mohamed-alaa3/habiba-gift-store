import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { WishlistStore } from '../stores/wishlist.store';
import { ApiSuccessResponse, ObjectId, Wishlist } from '../models';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private wishlistStore = inject(WishlistStore);
  private readonly endpoint = `${this.baseUrl}/wishlist`;

  get(): Observable<ApiSuccessResponse<Wishlist>> {
    return this.http
      .get<ApiSuccessResponse<Wishlist>>(this.endpoint)
      .pipe(tap((res) => this.wishlistStore.setWishlist(res.data)));
  }

  add(productId: ObjectId): Observable<ApiSuccessResponse<Wishlist>> {
    return this.http
      .post<ApiSuccessResponse<Wishlist>>(this.endpoint, { productId })
      .pipe(tap((res) => this.wishlistStore.setWishlist(res.data)));
  }

  remove(productId: ObjectId): Observable<ApiSuccessResponse<Wishlist>> {
    return this.http
      .delete<ApiSuccessResponse<Wishlist>>(`${this.endpoint}/${productId}`)
      .pipe(tap((res) => this.wishlistStore.setWishlist(res.data)));
  }

  resetLocal(): void {
    this.wishlistStore.clear();
  }
}