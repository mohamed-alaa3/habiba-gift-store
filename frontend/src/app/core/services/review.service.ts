import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { ApiSuccessResponse, ObjectId, Review } from '../models';

/**
 * Standalone review endpoints.
 * Note: create + list-by-product are also available from ProductService
 * (nested under /products/:id/reviews). This service exists for flexibility.
 */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.baseUrl}/reviews`;

  listByProduct(productId: ObjectId, page = 1, limit = 10): Observable<ApiSuccessResponse<Review[]>> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<ApiSuccessResponse<Review[]>>(
      `${this.baseUrl}/products/${productId}/reviews`,
      { params }
    );
  }
}