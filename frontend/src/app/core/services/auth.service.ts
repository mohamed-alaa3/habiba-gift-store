import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../tokens/api-base-url.token';
import { AuthStore } from '../stores/auth.store';
import {
  ApiSuccessResponse,
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = inject(API_BASE_URL);
  private authStore = inject(AuthStore);

  private readonly endpoint = `${this.baseUrl}/auth`;

  register(payload: RegisterPayload): Observable<ApiSuccessResponse<AuthResponse>> {
    return this.http
      .post<ApiSuccessResponse<AuthResponse>>(`${this.endpoint}/register`, payload)
      .pipe(tap((res) => this.authStore.setSession(res.data.user, res.data.token)));
  }

  login(payload: LoginPayload): Observable<ApiSuccessResponse<AuthResponse>> {
    return this.http
      .post<ApiSuccessResponse<AuthResponse>>(`${this.endpoint}/login`, payload)
      .pipe(tap((res) => this.authStore.setSession(res.data.user, res.data.token)));
  }

  me(): Observable<ApiSuccessResponse<User>> {
    return this.http
      .get<ApiSuccessResponse<User>>(`${this.endpoint}/me`)
      .pipe(tap((res) => this.authStore.updateUser(res.data)));
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ApiSuccessResponse<User>> {
    return this.http
      .patch<ApiSuccessResponse<User>>(`${this.endpoint}/me`, payload)
      .pipe(tap((res) => this.authStore.updateUser(res.data)));
  }

  changePassword(
    payload: ChangePasswordPayload,
  ): Observable<ApiSuccessResponse<{ message: string }>> {
    return this.http.patch<ApiSuccessResponse<{ message: string }>>(
      `${this.endpoint}/change-password`,
      payload,
    );
  }

  /**
   * Clears the current session and (optionally) redirects to the login page.
   * Use this everywhere a user signs out — never call `authStore.clear()` directly
   * from components, so the redirect logic stays in one place.
   */
  logout(redirectToLogin: boolean = true): void {
    this.authStore.clear();
    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }
}
