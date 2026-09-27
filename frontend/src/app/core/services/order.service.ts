import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import {
  ApiSuccessResponse,
  CreateOrderPayload,
  ObjectId,
  Order,
  OrderQuery,
  OrderStatus,
  OrderTracking,
  UpdateOrderStatusPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.baseUrl}/orders`;

  create(payload: CreateOrderPayload): Observable<ApiSuccessResponse<Order>> {
    return this.http.post<ApiSuccessResponse<Order>>(this.endpoint, payload);
  }

  list(query: OrderQuery = {}): Observable<ApiSuccessResponse<Order[]>> {
    return this.http.get<ApiSuccessResponse<Order[]>>(this.endpoint, {
      params: this.buildParams(query),
    });
  }

  getById(id: ObjectId): Observable<ApiSuccessResponse<Order>> {
    return this.http.get<ApiSuccessResponse<Order>>(`${this.endpoint}/${id}`);
  }

  getTracking(id: ObjectId): Observable<ApiSuccessResponse<OrderTracking>> {
    return this.http.get<ApiSuccessResponse<OrderTracking>>(`${this.endpoint}/${id}/tracking`);
  }

  updateStatus(id: ObjectId, payload: UpdateOrderStatusPayload): Observable<ApiSuccessResponse<Order>> {
    return this.http.patch<ApiSuccessResponse<Order>>(`${this.endpoint}/${id}/status`, payload);
  }

  private buildParams(query: OrderQuery): HttpParams {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.page != null) params = params.set('page', String(query.page));
    if (query.limit != null) params = params.set('limit', String(query.limit));
    return params;
  }
}